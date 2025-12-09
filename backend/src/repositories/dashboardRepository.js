import getPrismaClient from '../../prismaClient.js';

const prisma = getPrismaClient();

class DashboardRepository {
    async findActivesWithBalances(userId) {
        try {
            if (!prisma) {
                console.warn('[Dashboard Repository] Prisma not initialized, returning empty array');
                return [];
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
            return actives;
        } catch (error) {
            console.error('Dashboard Repository - findActivesWithBalances:', error);
            throw new Error(error.message || 'Erro ao buscar ativos com saldos');
        }
    }

    async findActivesWithLatestBalances(userId) {
        try {
            if (!prisma) {
                console.warn('[Dashboard Repository] Prisma not initialized, returning empty array');
                return [];
            }
            
            // Buscar ativos com balances históricos apenas até a data atual
            // Isso evita usar balances com datas futuras
            const now = new Date();
            
            const actives = await prisma.active.findMany({
                where: { userId },
                include: {
                    balances: { 
                        where: {
                            date: { lte: now }
                        },
                        orderBy: { date: 'desc' }, 
                        take: 1 
                    },
                },
            });

            return actives.map((a) => {
                // SEMPRE usar o saldo histórico mais recente se existir
                // Os balances históricos devem ser a fonte da verdade para o patrimônio atual
                // Agora considerando apenas balances com data <= hoje
                if (a.balances && a.balances.length > 0) {
                    return {
                        id: a.id,
                        name: a.name,
                        type: a.type,
                        latestBalance: Number(a.balances[0].value),
                    };
                }
                
                // Se não houver balance histórico, retornar 0
                // (o sistema deve manter balances atualizados)
                return {
                    id: a.id,
                    name: a.name,
                    type: a.type,
                    latestBalance: 0,
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
            
            const now = new Date();
            const dateFrom = new Date();
            dateFrom.setMonth(dateFrom.getMonth() - months);
            
            const balances = await prisma.historicalBalance.findMany({
                where: {
                    active: { userId },
                    date: { 
                        gte: dateFrom,
                        lte: now  // Não incluir balances com datas futuras
                    },
                },
                orderBy: { date: 'asc' },
                include: {
                    active: true,
                },
            });
            
            return balances;
        } catch (error) {
            console.error('Dashboard Repository - findBalanceHistory:', error);
            throw new Error(error.message || 'Erro ao buscar histórico de balances');
        }
    }
}

export default new DashboardRepository();