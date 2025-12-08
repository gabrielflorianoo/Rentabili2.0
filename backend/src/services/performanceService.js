import historicalBalanceRepository from '../repositories/historicalBalanceRepository.js';
import activesRepository from '../repositories/activeRepository.js';
import getPrismaClient from '../../prismaClient.js';

const prisma = getPrismaClient();

class PerformanceService {
    /**
     * Calcula o ganho/perda percentual para um ativo em um intervalo específico
     */
    async calculateGainLossPercentage(activeId, userId, startDate = null, endDate = null) {
        try {
            // Verificar se o ativo pertence ao usuário
            const active = await activesRepository.findById(activeId, userId);
            if (!active) {
                throw new Error('Ativo não encontrado');
            }

            // Buscar históricos de saldo
            const balances = await historicalBalanceRepository.findByActiveId(activeId, userId);
            
            if (balances.length === 0) {
                return {
                    activeId,
                    percentage: 0,
                    startValue: 0,
                    endValue: 0,
                    absoluteGain: 0,
                };
            }

            // Filtrar por datas se fornecidas
            let filteredBalances = balances;
            if (startDate) {
                const start = new Date(startDate);
                filteredBalances = filteredBalances.filter(b => new Date(b.date) >= start);
            }
            if (endDate) {
                const end = new Date(endDate);
                filteredBalances = filteredBalances.filter(b => new Date(b.date) <= end);
            }

            if (filteredBalances.length < 2) {
                return {
                    activeId,
                    percentage: 0,
                    startValue: filteredBalances.length > 0 ? Number(filteredBalances[0].value) : 0,
                    endValue: filteredBalances.length > 0 ? Number(filteredBalances[filteredBalances.length - 1].value) : 0,
                    absoluteGain: 0,
                };
            }

            const startValue = Number(filteredBalances[0].value);
            const endValue = Number(filteredBalances[filteredBalances.length - 1].value);
            const absoluteGain = endValue - startValue;
            const percentage = (absoluteGain / startValue) * 100;

            return {
                activeId,
                activeName: active.name,
                activeType: active.type,
                percentage: parseFloat(percentage.toFixed(2)),
                startValue: parseFloat(startValue.toFixed(2)),
                endValue: parseFloat(endValue.toFixed(2)),
                absoluteGain: parseFloat(absoluteGain.toFixed(2)),
            };
        } catch (error) {
            console.error('Erro ao calcular ganho/perda:', error);
            throw new Error(error.message || 'Erro ao calcular ganho/perda');
        }
    }

    /**
     * Calcula ganhos/perdas para todos os ativos do usuário em um período específico
     */
    async getAllPerformance(userId, startDate = null, endDate = null) {
        try {
            if (!userId) {
                throw new Error('userId é obrigatório');
            }

            // Buscar todos os ativos do usuário
            const actives = await activesRepository.findAll(userId);
            
            if (actives.length === 0) {
                return [];
            }

            // Calcular ganho/perda para cada ativo
            const performances = await Promise.all(
                actives.map(active =>
                    this.calculateGainLossPercentage(active.id, userId, startDate, endDate)
                )
            );

            // Ordenar por ganho percentual (melhor para pior)
            return performances.sort((a, b) => b.percentage - a.percentage);
        } catch (error) {
            console.error('Erro ao buscar performance geral:', error);
            throw new Error(error.message || 'Erro ao buscar performance');
        }
    }

    /**
     * Calcula ganhos/perdas para intervalos pré-definidos (últimos 7 dias, 30 dias, 90 dias, 1 ano, tudo)
     */
    async getPerformanceByPeriod(activeId, userId) {
        try {
            const today = new Date();
            const periods = {
                '7d': { label: 'Últimos 7 dias', startDate: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000) },
                '30d': { label: 'Últimos 30 dias', startDate: new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000) },
                '90d': { label: 'Últimos 90 dias', startDate: new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000) },
                '1y': { label: 'Último 1 ano', startDate: new Date(today.getFullYear() - 1, today.getMonth(), today.getDate()) },
                'all': { label: 'Desde o início', startDate: null },
            };

            const results = {};

            for (const [key, period] of Object.entries(periods)) {
                const performance = await this.calculateGainLossPercentage(
                    activeId,
                    userId,
                    period.startDate,
                    today
                );
                results[key] = {
                    ...performance,
                    label: period.label,
                };
            }

            return results;
        } catch (error) {
            console.error('Erro ao buscar performance por período:', error);
            throw new Error(error.message || 'Erro ao buscar performance por período');
        }
    }

    /**
     * Retorna os top 5 melhores e piores ativos
     */
    async getTopPerformers(userId, limit = 5) {
        try {
            if (!userId) {
                throw new Error('userId é obrigatório');
            }

            const performances = await this.getAllPerformance(userId);
            
            return {
                top: performances.slice(0, limit),
                worst: performances.slice(-limit).reverse(),
                all: performances,
            };
        } catch (error) {
            console.error('Erro ao buscar top performers:', error);
            throw new Error(error.message || 'Erro ao buscar top performers');
        }
    }

    /**
     * Calcula histórico de evolução mensal da carteira
     */
    async getPortfolioEvolution(userId, months = 12) {
        try {
            if (!userId) {
                throw new Error('userId é obrigatório');
            }

            // Buscar todos os ativos com históricos
            const actives = await prisma.active.findMany({
                where: { userId },
                include: {
                    balances: {
                        orderBy: { date: 'asc' },
                    },
                },
            });

            // Criar mapa de datas para valores totais
            const monthlyData = {};
            const now = new Date();
            
            for (let i = months - 1; i >= 0; i--) {
                const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
                const monthKey = date.toISOString().slice(0, 7); // YYYY-MM
                monthlyData[monthKey] = 0;
            }

            // Agregar valores por mês
            actives.forEach(active => {
                active.balances.forEach(balance => {
                    const monthKey = new Date(balance.date).toISOString().slice(0, 7);
                    if (monthlyData[monthKey] !== undefined) {
                        monthlyData[monthKey] += Number(balance.value);
                    }
                });
            });

            // Converter para array e preencher gaps
            const evolution = Object.entries(monthlyData).map(([month, value]) => {
                const [year, monthNum] = month.split('-');
                const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 
                                   'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
                return {
                    month: monthNames[parseInt(monthNum) - 1],
                    date: month,
                    value: parseFloat(value.toFixed(2)),
                };
            });

            return evolution;
        } catch (error) {
            console.error('Erro ao buscar evolução da carteira:', error);
            throw new Error(error.message || 'Erro ao buscar evolução da carteira');
        }
    }

    /**
     * Calcula alocação de ativos por tipo
     */
    async getAllocationByType(userId) {
        try {
            if (!userId) {
                throw new Error('userId é obrigatório');
            }

            // Buscar todos os ativos com últimos balances
            const actives = await prisma.active.findMany({
                where: { userId },
                include: {
                    balances: {
                        orderBy: { date: 'desc' },
                        take: 1,
                    },
                },
            });

            // Agrupar por tipo
            const allocation = {};
            let total = 0;

            actives.forEach(active => {
                const latestBalance = active.balances[0];
                if (latestBalance) {
                    const value = Number(latestBalance.value);
                    if (!allocation[active.type]) {
                        allocation[active.type] = 0;
                    }
                    allocation[active.type] += value;
                    total += value;
                }
            });

            // Converter para percentuais
            const result = Object.entries(allocation).map(([type, value]) => ({
                type,
                value: parseFloat(value.toFixed(2)),
                percentage: total > 0 ? parseFloat(((value / total) * 100).toFixed(2)) : 0,
            }));

            return result.sort((a, b) => b.value - a.value);
        } catch (error) {
            console.error('Erro ao buscar alocação por tipo:', error);
            throw new Error(error.message || 'Erro ao buscar alocação');
        }
    }

    /**
     * Retorna data dos últimos saldos para cada ativo
     */
    async getLastBalanceDates(userId) {
        try {
            if (!userId) {
                throw new Error('userId é obrigatório');
            }

            const actives = await prisma.active.findMany({
                where: { userId },
                include: {
                    balances: {
                        orderBy: { date: 'desc' },
                        take: 1,
                    },
                },
            });

            return actives
                .filter(a => a.balances.length > 0)
                .map(a => ({
                    activeId: a.id,
                    activeName: a.name,
                    lastBalanceDate: a.balances[0].date,
                    lastBalance: Number(a.balances[0].value),
                }));
        } catch (error) {
            console.error('Erro ao buscar datas de último saldo:', error);
            throw new Error(error.message || 'Erro ao buscar datas');
        }
    }
}

export default new PerformanceService();
