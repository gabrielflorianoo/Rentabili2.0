import getPrismaClient from '../../prismaClient.js';
const prisma = getPrismaClient();

class InvestmentRepository {
    async findAll(userId) {
        try {
            return await prisma.investment.findMany({
                where: { userId },
            });
        } catch (error) {
            console.error(error);
            throw new Error('Erro ao buscar investimentos no banco de dados');
        }
    }

    async findById(id) {
        try {
            return await prisma.investment.findUnique({
                where: { id: Number(id) },
            });
        } catch (error) {
            console.error(error);
            throw new Error(
                'Erro ao buscar investimento por ID no banco de dados',
            );
        }
    }

    async create(amount, activeId, date, kind, userId) {
        try {
            const newInvestment = await prisma.investment.create({
                data: {
                    amount,
                    activeId,
                    date,
                    kind: kind || 'Investimento',
                    userId,
                },
            });
            
            // Atualizar o balance histórico do ativo
            await this.updateActiveBalance(activeId, userId);
            
            return newInvestment;
        } catch (error) {
            console.error(error);
            throw new Error('Erro ao criar investimento no banco de dados');
        }
    }

    async update(id, amount, activeId, date, kind, userId) {
        try {
            const updatedInvestment = await prisma.investment.update({
                where: { id: Number(id) },
                data: {
                    amount,
                    activeId,
                    date,
                    kind,
                    userId,
                },
            });
            
            // Atualizar o balance histórico do ativo
            await this.updateActiveBalance(activeId, userId);
            
            return updatedInvestment;
        } catch (error) {
            console.error(error);
            throw new Error('Erro ao atualizar investimento no banco de dados');
        }
    }

    async remove(id) {
        try {
            // Buscar o investimento antes de deletar para pegar o activeId
            const investment = await prisma.investment.findUnique({
                where: { id: Number(id) }
            });
            
            if (!investment) {
                throw new Error('Investimento não encontrado');
            }
            
            await prisma.investment.delete({ where: { id: Number(id) } });
            
            // Atualizar o balance histórico do ativo
            await this.updateActiveBalance(investment.activeId, investment.userId);
        } catch (error) {
            console.error(error);
            throw new Error('Erro ao deletar investimento no banco de dados');
        }
    }

    async updateActiveBalance(activeId, userId) {
        try {
            // Buscar todos os investimentos do ativo
            const investments = await prisma.investment.findMany({
                where: { 
                    activeId: Number(activeId),
                    userId: Number(userId)
                },
                orderBy: { date: 'desc' }
            });

            if (investments.length === 0) {
                // Se não há mais investimentos, deletar o balance histórico
                await prisma.historicalBalance.deleteMany({
                    where: { activeId: Number(activeId) }
                });
                return;
            }

            // Separar aportes e rendas
            const aportes = investments.filter(inv => inv.kind !== 'Renda');
            const rendas = investments.filter(inv => inv.kind === 'Renda');

            // Calcular totais
            const totalAportado = aportes.reduce((sum, inv) => sum + Number(inv.amount), 0);
            const totalRendas = rendas.reduce((sum, inv) => sum + Number(inv.amount), 0);
            const patrimonioAtual = totalAportado + totalRendas;

            // Usar a data da transação mais recente
            const dataUltimaTransacao = investments[0].date;

            // Criar ou atualizar o balance histórico
            await prisma.historicalBalance.upsert({
                where: {
                    activeId_date: {
                        activeId: Number(activeId),
                        date: dataUltimaTransacao
                    }
                },
                update: {
                    value: patrimonioAtual
                },
                create: {
                    activeId: Number(activeId),
                    date: dataUltimaTransacao,
                    value: patrimonioAtual
                }
            });
        } catch (error) {
            console.error('Erro ao atualizar balance histórico:', error);
            // Não lançar erro para não quebrar a operação principal
        }
    }
}

export default new InvestmentRepository();
