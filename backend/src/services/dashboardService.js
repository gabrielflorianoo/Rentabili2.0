import dashboardRepository from '../repositories/dashboardRepository.js';

class DashboardService {
    /**
     * Converte valores Decimal do Prisma para Number, com validação
     * 
     * @param {number|string|Decimal} value - Valor para converter
     * @returns {number} Número validado ou 0
     */
    _safeNumber(value) {
        if (value === null || value === undefined) return 0;
        const num = Number(value);
        return isNaN(num) ? 0 : num;
    }

    /**
     * Formata número para 2 casas decimais
     * 
     * @param {number} value - Valor para formatar
     * @returns {number} Número com 2 casas decimais
     */
    _toFixed2(value) {
        return parseFloat(this._safeNumber(value).toFixed(2));
    }

    /**
     * ====== LÓGICA DE CÁLCULOS FINANCEIROS ======
     * 
     * PATRIMÔNIO TOTAL = Saldo dos Ativos + Saldo das Carteiras (Caixa)
     * TOTAL APORTADO   = Soma de todos os Investimentos (exceto 'Renda')
     * GANHO TOTAL      = Patrimônio Total - Total Aportado
     * RENTABILIDADE    = (Ganho Total / Total Aportado) × 100
     * 
     * Exemplo Prático:
     * - Você aportou R$ 10.000 (total investido)
     * - Seu patrimônio agora é R$ 15.000 (ativos + caixa)
     * - Seu ganho é R$ 5.000
     * - Sua rentabilidade é 50%
     * 
     * Se vê +359.3% de rentabilidade:
     * ✅ Significa que você aportou ~R$ 1.000 e o patrimônio cresceu para ~R$ 3.600
     * ✅ Ou seja, cada R$ 1 aportado virou R$ 3,60
     * 
     * ❌ Se aportou R$ 10.000 mas vê +359%, há erro nos dados do banco
     * ====== FIM DOCUMENTAÇÃO ======
     */
    async getSummary(userId) {
        try {
            if (!userId) throw new Error('Unauthorized');

            // --- MOCK MODE ---
            if (process.env.USE_DB !== 'true') {
                return {
                    totalBalance: 25000.00,
                    activesCount: 5,
                    walletsTotal: 5000.00,
                    investmentsCount: 3,
                };
            }

            // --- REAL MODE ---
            const [allInvestments, allWallets, allActives] = await Promise.all([
                dashboardRepository.findInvestments(userId),
                dashboardRepository.findWallets(userId),
                dashboardRepository.findActivesWithLatestBalances(userId),
            ]);

            // Calcular patrimônio total dos ativos
            const totalPatrimonioAtivos = allActives.reduce(
                (acc, active) => acc + this._safeNumber(active.latestBalance),
                0
            );

            // Somar saldo disponível nas carteiras
            const walletsTotal = allWallets.reduce(
                (acc, wallet) => acc + this._safeNumber(wallet.balance),
                0
            );

            // Patrimônio Total = Ativos + Caixa
            const totalBalance = totalPatrimonioAtivos + walletsTotal;

            // Contagem de ativos únicos que possuem investimentos
            const activeIdsWithInvestments = new Set(allInvestments.map(inv => inv.activeId));
            
            // Contar apenas transações de aporte (ignorar rendas)
            const investmentsCount = allInvestments.filter(inv => inv.kind !== 'Renda').length;

            return {
                totalBalance: this._toFixed2(totalBalance),
                activesCount: activeIdsWithInvestments.size,
                walletsTotal: this._toFixed2(walletsTotal),
                investmentsCount,
            };

        } catch (error) {
            console.error('DashboardService - getSummary:', error);
            throw new Error(error.message || 'Erro ao obter resumo do dashboard');
        }
    }

    async getDashboard(userId) {
        try {
            if (!userId) throw new Error('Unauthorized');

            // --- MOCK MODE (Mantido para testes) ---
            if (process.env.USE_DB !== 'true') {
                return this._getMockDashboard();
            }

            // --- REAL MODE ---
            // 1. Buscar dados em paralelo
            const [allInvestments, allWallets, allTransactions, balanceHistory, allActives] =
                await Promise.all([
                    dashboardRepository.findInvestments(userId),
                    dashboardRepository.findWallets(userId),
                    dashboardRepository.findTransactions(userId),
                    dashboardRepository.findBalanceHistory(userId, 12),
                    dashboardRepository.findActivesWithLatestBalances(userId),
                ]);

            // 2. Processar Ativos e Saldos Atuais
            const activesMap = new Map();
            allActives.forEach(active => {
                activesMap.set(active.id, {
                    ...active,
                    latestBalance: this._safeNumber(active.latestBalance)
                });
            });

            // 3. Processar Investimentos (Cálculo do Custo de Aquisição / Total Aportado)
            const investmentsStats = new Map(); // activeId -> { totalAportado: number, count: number }

            allInvestments.forEach(inv => {
                if (!investmentsStats.has(inv.activeId)) {
                    investmentsStats.set(inv.activeId, { totalAportado: 0, count: 0 });
                }
                
                const stats = investmentsStats.get(inv.activeId);
                const amount = this._safeNumber(inv.amount);

                // Lógica Financeira:
                // Se kind !== 'Renda', consideramos aporte (dinheiro novo ou reinvestimento manual).
                // Se kind === 'Renda' (Dividendos/JCP), não soma no Custo de Aquisição, pois é retorno.
                if (inv.kind !== 'Renda') {
                    stats.totalAportado += amount;
                    stats.count += 1;
                }
            });

            // 4. Consolidar Lista de Ativos para o Frontend
            let totalAportadoGeral = 0;
            let totalPatrimonioAtivos = 0;

            const actives = Array.from(activesMap.values()).map(active => {
                const stats = investmentsStats.get(active.id) || { totalAportado: 0, count: 0 };
                
                totalAportadoGeral += stats.totalAportado;
                totalPatrimonioAtivos += active.latestBalance;

                return {
                    id: active.id,
                    name: active.name,
                    type: active.type,
                    latestBalance: this._toFixed2(active.latestBalance),
                    totalAportado: this._toFixed2(stats.totalAportado),
                    investmentsCount: stats.count,
                    // Rentabilidade individual
                    profitability: stats.totalAportado > 0 
                        ? this._toFixed2((((active.latestBalance - stats.totalAportado) / stats.totalAportado) * 100))
                        : 0
                };
            }).sort((a, b) => b.latestBalance - a.latestBalance); // Ordenar por maior saldo

            // 5. Calcular Totais Gerais
            const walletsTotal = allWallets.reduce((acc, w) => acc + this._safeNumber(w.balance), 0);
            const totalBalance = totalPatrimonioAtivos + walletsTotal; // Patrimônio Global
            
            // CORREÇÃO: totalGain = Patrimônio Total - Total Aportado (não apenas ativos)
            // Explicação: Se você aportou R$ 10.000 e agora tem R$ 15.000 (incluindo caixa), ganhou R$ 5.000
            const totalGain = totalBalance - totalAportadoGeral;

            // Rentabilidade Geral = (Ganho / Total Aportado) × 100
            // Apenas calcula se houve aporte real
            const profitability = totalAportadoGeral > 0
                ? this._toFixed2(((totalGain / totalAportadoGeral) * 100))
                : 0;

            // 6. Gráfico de Alocação
            const allocationChart = actives
                .filter(a => a.latestBalance > 0)
                .map(a => ({
                    name: a.name,
                    value: a.latestBalance,
                    percentage: totalBalance > 0 
                        ? this._toFixed2(((a.latestBalance / totalBalance) * 100))
                        : 0
                }));

            // 7. Gráfico de Evolução (Histórico ou Reconstruído)
            let evolutionChart = [];
            if (balanceHistory && balanceHistory.length > 0) {
                evolutionChart = this._buildEvolutionChartFromHistory(balanceHistory);
            } else {
                evolutionChart = this._buildEvolutionChartFromInvestmentsCumulative(allInvestments);
            }

            // 8. Filtrar listas para retorno
            const investmentsOnly = allInvestments.filter(inv => inv.kind !== 'Renda');

            return {
                summary: {
                    totalBalance: this._toFixed2(totalBalance),
                    activesCount: actives.length,
                    walletsTotal: this._toFixed2(walletsTotal),
                    investmentsCount: investmentsOnly.length,
                },
                totalBalance: this._toFixed2(totalBalance),
                totalInvested: this._toFixed2(totalAportadoGeral),
                totalGain: this._toFixed2(totalGain),
                profitability,
                allocationChart,
                evolutionChart, // Agora cumulativo
                historyChart: evolutionChart, // Mantendo compatibilidade de nome se o front usar
                actives,
                wallets: allWallets.map(w => ({
                    id: w.id,
                    name: w.name,
                    balance: this._toFixed2(w.balance)
                })),
                investments: investmentsOnly.map(inv => ({
                    id: inv.id,
                    amount: this._toFixed2(inv.amount),
                    activeId: inv.activeId,
                    active: { name: inv.active?.name || 'Ativo' },
                    date: inv.date,
                    kind: inv.kind,
                })),
                recentTransactions: allTransactions.map(t => ({
                    id: t.id,
                    amount: this._toFixed2(t.amount),
                    type: t.type,
                    description: t.description,
                    date: t.date,
                })),
            };

        } catch (error) {
            console.error('DashboardService - getDashboard:', error);
            throw new Error(error.message || 'Erro ao processar dados financeiros');
        }
    }

    // --- HELPER METHODS ---

    _buildEvolutionChartFromHistory(balanceHistory) {
        if (!balanceHistory || balanceHistory.length === 0) return [];

        // CORREÇÃO CRÍTICA: balanceHistory contém saldos de CADA ATIVO
        // Precisamos agrupar por DATA e SOMAR todos os ativos de cada data
        // para obter o patrimônio total
        
        const balanceByDate = {};

        balanceHistory.forEach(h => {
            const date = new Date(h.date);
            // Chave: YYYY-MM-DD para agrupar todas as movimentações do mesmo dia
            const dateKey = date.toISOString().split('T')[0];
            
            if (!balanceByDate[dateKey]) {
                balanceByDate[dateKey] = {
                    totalValue: 0,
                    date: new Date(dateKey)
                };
            }
            
            // Somar o saldo deste ativo nesta data
            balanceByDate[dateKey].totalValue += Number(h.value || 0);
        });

        // Agrupar por MÊS, pegando o último dia do mês
        const balanceByMonth = {};
        
        Object.entries(balanceByDate)
            .sort(([a], [b]) => a.localeCompare(b))
            .forEach(([dateKey, data]) => {
                const date = new Date(dateKey);
                // Chave YYYY-MM para agrupamento mensal
                const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                
                // Sempre sobrescrever com o valor mais recente do mês (último dia)
                balanceByMonth[monthKey] = {
                    month: date.toLocaleString('pt-BR', { month: 'short' }),
                    value: data.totalValue
                };
            });

        return Object.keys(balanceByMonth)
            .sort() // Ordena cronologicamente YYYY-MM
            .map(key => ({
                month: balanceByMonth[key].month,
                value: Math.round(balanceByMonth[key].value)
            }))
            .slice(-12); // Últimos 12 meses
    }

    /**
     * Reconstrói a evolução do patrimônio baseada nos aportes.
     * CORREÇÃO CRÍTICA: O gráfico deve ser CUMULATIVO.
     */
    _buildEvolutionChartFromInvestmentsCumulative(investments) {
        if (!investments || investments.length === 0) return [];

        // 1. Agrupar movimentações por mês
        const movementsByMonth = {};

        investments.forEach(inv => {
            const date = new Date(inv.date);
            const sortKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            const label = date.toLocaleString('pt-BR', { month: 'short', year: '2-digit' });

            if (!movementsByMonth[sortKey]) {
                movementsByMonth[sortKey] = { label, netFlow: 0 };
            }

            // Somamos tudo (Aportes + Rendas reinvestidas + Valorização implícita)
            // Como estamos reconstruindo apenas por fluxo de caixa:
            movementsByMonth[sortKey].netFlow += this._safeNumber(inv.amount);
        });

        // 2. Ordenar chaves cronologicamente
        const sortedKeys = Object.keys(movementsByMonth).sort();

        // 3. Gerar acumulado
        let accumulatedBalance = 0;
        const chartData = [];

        sortedKeys.forEach(key => {
            accumulatedBalance += movementsByMonth[key].netFlow;
            chartData.push({
                month: movementsByMonth[key].label, // Ex: "jan/24"
                value: this._toFixed2(accumulatedBalance)
            });
        });

        // Retorna apenas os últimos 12 meses se desejar cortar
        return chartData.slice(-12); 
    }

    _getMockDashboard() {
        // Mock separado para não poluir o código principal
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
                { name: 'Ações', value: 45 },
                { name: 'FII', value: 30 },
                { name: 'Renda Fixa', value: 15 },
                { name: 'Cripto', value: 10 },
            ],
            evolutionChart: [
                { month: 'Jan', value: 18000 },
                { month: 'Fev', value: 19500 },
                { month: 'Mar', value: 21000 },
                { month: 'Abr', value: 22500 }, // Evolução crescente
                { month: 'Mai', value: 24000 },
                { month: 'Jun', value: 25000 },
            ],
            actives: [
                { id: 1, name: 'PETR4', type: 'stock', latestBalance: 5000, totalAportado: 4000, profitability: 25 },
                { id: 2, name: 'MXRF11', type: 'fii', latestBalance: 4000, totalAportado: 3500, profitability: 14.28 },
            ],
            wallets: [{ id: 1, name: 'Carteira Principal', balance: 5000.00 }],
            investments: [],
            recentTransactions: []
        };
    }
}

export default new DashboardService();