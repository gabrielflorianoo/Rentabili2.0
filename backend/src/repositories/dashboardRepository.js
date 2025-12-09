import getPrismaClient from '../../prismaClient.js';

const prisma = getPrismaClient();

class DashboardRepository {
    async findActivesWithLatestBalances(userId) {
        try {
            if (!prisma) {
                console.warn('[Dashboard Repository] Prisma not initialized, returning empty array');
                return [];
            }
            
            // Buscar ativos com seus investimentos
            const actives = await prisma.active.findMany({
                where: { userId },
                include: {
                    investments: true
                },
            });

            // Calcular saldo de cada ativo baseado em investimentos
            return actives.map((a) => {
                // Calcular saldo: aportes + ganhos (rendas)
                const totalAportes = a.investments
                    .filter(inv => inv.kind !== 'Renda')
                    .reduce((sum, inv) => sum + Number(inv.amount || 0), 0);

                const totalRendas = a.investments
                    .filter(inv => inv.kind === 'Renda')
                    .reduce((sum, inv) => sum + Number(inv.amount || 0), 0);

                const latestBalance = totalAportes + totalRendas;

                return {
                    id: a.id,
                    name: a.name,
                    type: a.type,
                    latestBalance: Math.max(latestBalance, 0),
                };
            });
        } catch (error) {
            console.error('Dashboard Repository - findActivesWithLatestBalances:', error);
            throw new Error(error.message || 'Erro ao buscar saldos atualizados');
        }
    }

    async findWallets(userId) {
        try {
            if (!prisma) {
                console.warn('[Dashboard Repository] Prisma not initialized, returning empty array');
                return [];
            }
            
            const now = new Date();
            
            // Buscar carteiras com suas transações para calcular o saldo real
            const wallets = await prisma.wallet.findMany({ 
                where: { userId },
                include: {
                    transactions: {
                        where: {
                            date: { lte: now }  // Apenas transações até a data atual
                        },
                        select: {
                            amount: true,
                            type: true
                        }
                    }
                },
                orderBy: { createdAt: 'desc' }
            });

            // Calcular o saldo real de cada carteira baseado nas transações
            return wallets.map(wallet => {
                // Calcular saldo a partir das transações
                const calculatedBalance = wallet.transactions.reduce((balance, transaction) => {
                    const amount = Number(transaction.amount || 0);
                    
                    // Validar tipo de transação
                    if (transaction.type === 'income') {
                        return balance + amount;
                    } else if (transaction.type === 'expense') {
                        return balance - amount;
                    } else {
                        // Log de warning para tipos desconhecidos
                        console.warn(`[Dashboard Repository] Unknown transaction type '${transaction.type}' for transaction in wallet ${wallet.id}. Skipping.`);
                        return balance;
                    }
                }, 0);

                // Retornar carteira com saldo calculado
                return {
                    id: wallet.id,
                    name: wallet.name,
                    balance: calculatedBalance,
                    userId: wallet.userId,
                    createdAt: wallet.createdAt,
                    updatedAt: wallet.updatedAt
                };
            });
        } catch (error) {
            console.error('Dashboard Repository - findWallets:', error);
            throw new Error(error.message || 'Erro ao buscar carteiras');
        }
    }

    async findTransactions(userId) {
        try {
            if (!prisma) {
                console.warn('[Dashboard Repository] Prisma not initialized, returning empty array');
                return [];
            }
            
            const now = new Date();
            
            return await prisma.transaction.findMany({
                where: { 
                    userId,
                    date: { lte: now }  // Não incluir transações com datas futuras
                },
                orderBy: { date: 'desc' },
                include: {
                    wallet: true,
                }
            });
        } catch (error) {
            console.error('Dashboard Repository - findTransactions:', error);
            throw new Error(error.message || 'Erro ao buscar transações');
        }
    }

    async findInvestments(userId) {
        try {
            if (!prisma) {
                console.warn('[Dashboard Repository] Prisma not initialized, returning empty array');
                return [];
            }
            
            const now = new Date();
            
            return await prisma.investment.findMany({
                where: { 
                    userId,
                    date: { lte: now }  // Não incluir investimentos com datas futuras
                },
                include: {
                    active: true,
                },
                orderBy: { date: 'desc' },
            });
        } catch (error) {
            console.error('Dashboard Repository - findInvestments:', error);
            throw new Error(error.message || 'Erro ao buscar investimentos');
        }
    }

    async findBalanceHistory(userId, months = 6) {
        try {
            if (!prisma) {
                console.warn('[Dashboard Repository] Prisma not initialized, returning empty array');
                return [];
            }
            
            // Historical balance foi removido
            // Retornar array vazio
            return [];
        } catch (error) {
            console.error('Dashboard Repository - findBalanceHistory:', error);
            throw new Error(error.message || 'Erro ao buscar histórico de balances');
        }
    }
}

export default new DashboardRepository();