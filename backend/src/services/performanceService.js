import activesRepository from '../repositories/activeRepository.js';
import getPrismaClient from '../../prismaClient.js';

const prisma = getPrismaClient();

class PerformanceService {
    /**
     * Calcula o ganho/perda percentual para um ativo em um intervalo específico
     * Baseado em investimentos do tipo 'Renda' (ganhos)
     */
    async calculateGainLossPercentage(activeId, userId, startDate = null, endDate = null) {
        try {
            // Verificar se o ativo pertence ao usuário
            const active = await activesRepository.findById(activeId, userId);
            if (!active) {
                throw new Error('Ativo não encontrado');
            }

            // Buscar investimentos do tipo 'Renda' (ganhos/rendimentos)
            const investments = await prisma.investment.findMany({
                where: {
                    activeId: Number(activeId),
                    userId: Number(userId),
                    kind: 'Renda',
                },
                orderBy: { date: 'asc' },
                select: {
                    date: true,
                    amount: true,
                },
            });

            if (investments.length === 0) {
                return {
                    activeId,
                    activeName: active.name,
                    activeType: active.type,
                    percentage: 0,
                    startValue: 0,
                    endValue: 0,
                    absoluteGain: 0,
                };
            }

            // Filtrar por datas se fornecidas
            let filteredInvestments = investments;
            if (startDate) {
                const start = new Date(startDate);
                filteredInvestments = filteredInvestments.filter(inv => new Date(inv.date) >= start);
            }
            if (endDate) {
                const end = new Date(endDate);
                filteredInvestments = filteredInvestments.filter(inv => new Date(inv.date) <= end);
            }

            if (filteredInvestments.length === 0) {
                return {
                    activeId,
                    activeName: active.name,
                    activeType: active.type,
                    percentage: 0,
                    startValue: 0,
                    endValue: 0,
                    absoluteGain: 0,
                };
            }

            const startValue = Number(filteredInvestments[0].amount);
            const endValue = Number(filteredInvestments[filteredInvestments.length - 1].amount);
            const absoluteGain = endValue - startValue;
            const percentage = startValue !== 0 ? (absoluteGain / startValue) * 100 : 0;
            
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
     * Calcula histórico de evolução mensal da carteira baseado em investimentos
     */
    async getPortfolioEvolution(userId, months = 12) {
        try {
            if (!userId) {
                throw new Error('userId é obrigatório');
            }

            // Buscar todos os investimentos do usuário
            const investments = await prisma.investment.findMany({
                where: { userId: Number(userId) },
                orderBy: { date: 'asc' },
                select: {
                    date: true,
                    amount: true,
                    kind: true,
                },
            });

            // Criar mapa de datas para valores totais
            const monthlyData = {};
            const now = new Date();

            // Inicializar últimos N meses
            for (let i = months - 1; i >= 0; i--) {
                const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
                const monthKey = date.toISOString().slice(0, 7); // YYYY-MM
                monthlyData[monthKey] = 0;
            }

            // Agregar valores por mês (aportes + rendas)
            investments.forEach(investment => {
                const monthKey = new Date(investment.date).toISOString().slice(0, 7);
                if (monthlyData[monthKey] !== undefined) {
                    monthlyData[monthKey] += Number(investment.amount);
                }
            });

            // Converter para array com acumulado
            const evolution = [];
            let accumulated = 0;
            Object.entries(monthlyData).forEach(([month, value]) => {
                accumulated += value;
                const [year, monthNum] = month.split('-');
                const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
                    'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
                evolution.push({
                    month: monthNames[parseInt(monthNum) - 1],
                    date: month,
                    value: parseFloat(accumulated.toFixed(2)),
                });
            });

            return evolution;
        } catch (error) {
            console.error('Erro ao buscar evolução da carteira:', error);
            throw new Error(error.message || 'Erro ao buscar evolução da carteira');
        }
    }

    /**
     * Calcula alocação de ativos por tipo baseado em investimentos atuais
     */
    async getAllocationByType(userId) {
        try {
            if (!userId) {
                throw new Error('userId é obrigatório');
            }

            // Buscar todos os ativos com investimentos
            const actives = await prisma.active.findMany({
                where: { userId: Number(userId) },
                include: {
                    investments: {
                        where: { userId: Number(userId) },
                    },
                },
            });

            // Calcular saldo total para cada ativo
            const allocationData = {};
            let total = 0;

            actives.forEach(active => {
                // Somar aportes (kind !== 'Renda') + rendas (kind === 'Renda')
                const totalAportes = active.investments
                    .filter(inv => inv.kind !== 'Renda')
                    .reduce((sum, inv) => sum + Number(inv.amount), 0);
                
                const totalRendas = active.investments
                    .filter(inv => inv.kind === 'Renda')
                    .reduce((sum, inv) => sum + Number(inv.amount), 0);
                
                const activeTotal = totalAportes + totalRendas;
                
                if (activeTotal > 0) {
                    if (!allocationData[active.type]) {
                        allocationData[active.type] = 0;
                    }
                    allocationData[active.type] += activeTotal;
                    total += activeTotal;
                }
            });

            // Converter para percentuais
            const result = Object.entries(allocationData).map(([type, value]) => ({
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
     * Retorna data do último investimento e saldo total para cada ativo
     */
    async getLastBalanceDates(userId) {
        try {
            if (!userId) {
                throw new Error('userId é obrigatório');
            }

            const actives = await prisma.active.findMany({
                where: { userId: Number(userId) },
                include: {
                    investments: {
                        where: { userId: Number(userId) },
                        orderBy: { date: 'desc' },
                    },
                },
            });

            return actives
                .filter(a => a.investments.length > 0)
                .map(a => {
                    // Calcular saldo total do ativo
                    const totalAportes = a.investments
                        .filter(inv => inv.kind !== 'Renda')
                        .reduce((sum, inv) => sum + Number(inv.amount), 0);
                    const totalRendas = a.investments
                        .filter(inv => inv.kind === 'Renda')
                        .reduce((sum, inv) => sum + Number(inv.amount), 0);
                    
                    return {
                        activeId: a.id,
                        activeName: a.name,
                        lastBalanceDate: a.investments[0].date,
                        lastBalance: parseFloat((totalAportes + totalRendas).toFixed(2)),
                    };
                });
        } catch (error) {
            console.error('Erro ao buscar datas de último saldo:', error);
            throw new Error(error.message || 'Erro ao buscar datas');
        }
    }
}

export default new PerformanceService();
