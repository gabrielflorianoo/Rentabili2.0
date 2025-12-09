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
            
            return updatedInvestment;
        } catch (error) {
            console.error(error);
            throw new Error('Erro ao atualizar investimento no banco de dados');
        }
    }

    async remove(id) {
        try {
            await prisma.investment.delete({ where: { id: Number(id) } });
        } catch (error) {
            console.error(error);
            throw new Error('Erro ao deletar investimento no banco de dados');
        }
    }
}

export default new InvestmentRepository();
