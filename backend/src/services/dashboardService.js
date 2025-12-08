import dashboardRepository from '../repositories/dashboardRepository.js';
import investmentService from './investmentService.js';

class DashboardService {
    async getSummary(userId) {
        try {
            if (!userId) {
                throw new Error('Unauthorized');
            }

            if (process.env.USE_DB !== 'true') {
                // Mock data mais realista
                return {
                    totalBalance: 25000.00,
                    activesCount: 5,
                    walletsTotal: 5000.00,
                    investmentsCount: 3,
                };
            }

            const actives =
                await dashboardRepository.findActivesWithBalances(userId);

            let totalBalance = 0;
            actives.forEach((active) => {
                if (active.balances.length > 0) {
                    totalBalance += Number(active.balances[0].value);
                }
            });

            // Obter número de ativos diferentes com investimentos
            const activesCount = await investmentService.getDifferentActivesCount(userId);

            return {
                totalBalance,
                activesCount,
            };
        } catch (error) {
            console.error('DashboardService - getSummary:', error);
            throw new Error(error.message || 'Erro ao obter resumo do dashboard');
        }
    }

    async getDashboard(userId) {
        try {
            if (!userId) {
                throw new Error('Unauthorized');
            }

            if (process.env.USE_DB !== 'true') {
                // Mock completo do dashboard com dados mais realistas
                return {
                    summary: {
                        totalBalance: 25000.00,
                        activesCount: 5,
                        walletsTotal: 5000.00,
                        investmentsCount: 3,
                    },
                    totalBalance: 25000.00,
                    totalInvested: 20000.00,
                    totalGain: 5000.00,
                    profitability: 25.00,
                    allocationChart: [
                        {
                            name: 'Ações',
                            value: 45,
                        },
                        {
                            name: 'FII',
                            value: 30,
                        },
                        {
                            name: 'Renda Fixa',
                            value: 15,
                        },
                        {
                            name: 'Criptomoedas',
                            value: 10,
                        },
                    ],
                    historyChart: [
                        { month: 'Jan', amount: 18000 },
                        { month: 'Fev', amount: 19500 },
                        { month: 'Mar', amount: 21000 },
                        { month: 'Abr', amount: 22500 },
                        { month: 'Mai', amount: 24000 },
                        { month: 'Jun', amount: 25000 },
                    ],
                    evolutionChart: [
                        { month: 'Jan', value: 18000 },
                        { month: 'Fev', value: 19500 },
                        { month: 'Mar', value: 21000 },
                        { month: 'Abr', value: 22500 },
                        { month: 'Mai', value: 24000 },
                        { month: 'Jun', value: 25000 },
                    ],
                    actives: [
                        {
                            id: 1,
                            name: 'PETR4',
                            type: 'stock',
                            latestBalance: 5000,
                        },
                        {
                            id: 2,
                            name: 'MXRF11',
                            type: 'fii',
                            latestBalance: 4000,
                        },
                        {
                            id: 3,
                            name: 'Tesouro Direto',
                            type: 'fixed-income',
                            latestBalance: 6000,
                        },
                        {
                            id: 4,
                            name: 'Bitcoin',
                            type: 'crypto',
                            latestBalance: 3000,
                        },
                        {
                            id: 5,
                            name: 'Ethereum',
                            type: 'crypto',
                            latestBalance: 2000,
                        },
                    ],
                    wallets: [
                        { id: 1, name: 'Carteira Principal', balance: 5000.00 },
                    ],
                    investments: [
                        {
                            id: 1,
                            amount: 1000,
                            activeId: 1,
                            active: { name: 'PETR4' },
                            date: new Date(),
                            kind: 'Compra',
                        },
                        {
                            id: 2,
                            amount: 2000,
                            activeId: 2,
                            active: { name: 'MXRF11' },
                            date: new Date(),
                            kind: 'Compra',
                        },
                        {
                            id: 3,
                            amount: 1500,
                            activeId: 3,
                            active: { name: 'Tesouro' },
                            date: new Date(),
                            kind: 'Aplicação',
                        },
                    ],
                    recentTransactions: [
                        {
                            id: 1,
                            amount: 1000.00,
                            type: 'income',
                            description: 'Depósito',
                            date: new Date(),
                            kind: 'Investimento',
                        },
                        {
                            id: 2,
                            amount: 500.00,
                            type: 'expense',
                            description: 'Taxa de investimento',
                            date: new Date(),
                            kind: 'Rendimento',
                        },
                        {
                            id: 3,
                            amount: 250.00,
                            type: 'income',
                            description: 'Dividendos',
                            date: new Date(),
                            kind: 'Rendimento',
                        },
                    ],
                };
            }

            const [investments, wallets, transactions, balanceHistory] =
                await Promise.all([
                    dashboardRepository.findInvestments(userId),
                    dashboardRepository.findWallets(userId),
                    dashboardRepository.findTransactions(userId),
                    dashboardRepository.findBalanceHistory(userId, 6),
                ]);

            // Calcular saldo de cada ativo a partir dos investimentos e saldos históricos
            const activesMap = new Map();
            
            // Primeiro, processar todos os investimentos para saber quais ativos existem
            investments.forEach((inv) => {
                if (!activesMap.has(inv.activeId)) {
                    activesMap.set(inv.activeId, {
                        id: inv.activeId,
                        name: inv.active.name,
                        type: inv.active.type,
                        totalAportado: 0, // Apenas aportes reais (sem rendas)
                        currentBalance: 0, // Saldo atual do ativo
                    });
                }
                
                const active = activesMap.get(inv.activeId);
                const amount = Number(inv.amount || 0);
                
                // Somar apenas investimentos que NÃO são rendas para calcular total aportado
                if (inv.kind !== 'Renda') {
                    active.totalAportado += amount;
                }
            });

            // Buscar saldo mais recente de cada ativo usando balances históricos
            const activesWithBalances = await dashboardRepository.findActivesWithLatestBalances(userId);
            
            // Atualizar saldos atuais baseado nos balances históricos
            activesWithBalances.forEach((activeData) => {
                if (activesMap.has(activeData.id)) {
                    const active = activesMap.get(activeData.id);
                    active.currentBalance = activeData.latestBalance || 0;
                }
            });

            // Calcular totais
            let totalAportado = 0; // Total investido SEM rendas
            let totalPatrimonio = 0; // Patrimônio atual total
            
            const actives = Array.from(activesMap.values()).map((a) => {
                totalAportado += a.totalAportado;
                totalPatrimonio += a.currentBalance;
                
                return {
                    id: a.id,
                    name: a.name,
                    type: a.type,
                    latestBalance: a.currentBalance,
                    totalAportado: a.totalAportado,
                };
            });

            // Somar carteiras ao patrimônio total
            const walletsTotal = wallets.reduce((s, w) => s + Number(w.balance || 0), 0);
            const totalBalance = totalPatrimonio + walletsTotal;

            // Total investido = apenas aportes (sem rendas)
            const totalInvested = totalAportado;
            
            // Ganho total = patrimônio atual - total aportado
            const totalGain = totalPatrimonio - totalAportado;
            
            // Rentabilidade = ((patrimônio atual - total aportado) / total aportado) × 100
            const profitability = totalAportado > 0 
                ? parseFloat(((totalGain / totalAportado) * 100).toFixed(2))
                : 0;

            // Criar gráfico de alocação
            const allocationChart = actives
                .filter((a) => a.latestBalance > 0)
                .map((a) => ({
                    name: a.name,
                    value: a.latestBalance,
                    percentage: totalBalance > 0 
                        ? parseFloat(((a.latestBalance / totalBalance) * 100).toFixed(2))
                        : 0,
                }))
                .sort((a, b) => b.value - a.value);

            // Criar gráfico de evolução
            let evolutionChart = [];
            if (balanceHistory && balanceHistory.length > 0) {
                evolutionChart = this._buildEvolutionChartFromHistory(balanceHistory);
            } else {
                // Se não há histórico, reconstruir a partir dos investimentos
                evolutionChart = this._buildEvolutionChartFromInvestments(investments);
            }

            // Apenas investimentos (sem rendas)
            const investmentsOnly = investments.filter((inv) => inv.kind !== 'Renda');
            
            // Obter número de ativos diferentes com investimentos
            const activesCountWithInvestments = await investmentService.getDifferentActivesCount(userId);

            return {
                summary: {
                    totalBalance,
                    activesCount: activesCountWithInvestments,
                    walletsTotal,
                    investmentsCount: investmentsOnly.length,
                },
                totalBalance,
                totalInvested,
                totalGain,
                profitability,
                allocationChart,
                historyChart: evolutionChart,
                evolutionChart,
                actives,
                wallets,
                investments: investmentsOnly,
                recentTransactions: transactions,
            };
        } catch (error) {
            console.error('DashboardService - getDashboard:', error);
            throw new Error(error.message || 'Erro ao processar dados financeiros');
        }
    }

    _buildEvolutionChartFromHistory(balanceHistory) {
        // Se não há histórico, retorna gráfico vazio
        if (!balanceHistory || balanceHistory.length === 0) {
            return [];
        }

        // Agrupar por data (um saldo por data)
        const balanceByDate = {};
        balanceHistory.forEach((balance) => {
            const dateKey = balance.date.toISOString().split('T')[0];
            if (!balanceByDate[dateKey]) {
                balanceByDate[dateKey] = 0;
            }
            balanceByDate[dateKey] += Number(balance.value || 0);
        });

        // Ordenar datas
        const sortedDates = Object.keys(balanceByDate).sort();

        // Converter para array com dados de evolução
        const monthlyData = {};
        sortedDates.forEach((date) => {
            const d = new Date(date);
            const monthKey = d.toLocaleString('pt-BR', { month: 'short' });
            const yearMonth = `${monthKey}`;
            
            if (!monthlyData[yearMonth]) {
                monthlyData[yearMonth] = 0;
            }
            monthlyData[yearMonth] = Math.max(monthlyData[yearMonth], balanceByDate[date]);
        });

        // Converter em array e retornar
        return Object.entries(monthlyData).map(([month, value]) => ({
            month,
            value: Math.round(value),
        }));
    }

    _buildEvolutionChartFromInvestments(investments) {
        // Se não há investimentos, retorna gráfico vazio
        if (!investments || investments.length === 0) {
            return [];
        }

        // Agrupar investimentos por mês/ano com suas somas acumuladas por ativo
        const monthlyBalanceByActive = {};
        
        investments.forEach((inv) => {
            const date = new Date(inv.date);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            const monthLabel = date.toLocaleString('pt-BR', { month: 'short', year: '2-digit' });
            
            if (!monthlyBalanceByActive[monthKey]) {
                monthlyBalanceByActive[monthKey] = {
                    label: monthLabel,
                    activeBalances: {},
                };
            }
            
            const month = monthlyBalanceByActive[monthKey];
            const activeId = inv.activeId;
            
            if (!month.activeBalances[activeId]) {
                month.activeBalances[activeId] = 0;
            }
            
            // Somar todos os investimentos deste ativo (incluindo rendas)
            month.activeBalances[activeId] += Number(inv.amount || 0);
        });

        // Converter para array e calcular saldos acumulados
        const sortedMonths = Object.keys(monthlyBalanceByActive)
            .sort()
            .map((monthKey) => {
                const month = monthlyBalanceByActive[monthKey];
                const totalMonth = Object.values(month.activeBalances).reduce((a, b) => a + b, 0);
                return {
                    month: month.label,
                    value: Math.round(totalMonth),
                };
            });

        return sortedMonths;
    }
}

export default new DashboardService();
