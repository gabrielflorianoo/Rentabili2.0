// backend/src/repositories/historicalBalanceRepository.js
import getPrismaClient from '../../prismaClient.js';
const prisma = getPrismaClient();

class HistoricalBalanceRepository {
    async create(date, value, activeId, userId) {
        try {
            const historicalBalance = await prisma.historicalBalance.create({
                data: {
                    date: new Date(date),
                    value: parseFloat(value),
                    activeId: parseInt(activeId),
                },
            });
            return historicalBalance;
        } catch (error) {
            console.error(error);
            throw new Error(
                'Erro ao criar balanço histórico no banco de dados',
            );
        }
    }

    async findByActiveId(activeId, userId) {
        try {
            // Verify that the active belongs to the user
            const active = await prisma.active.findUnique({
                where: {
                    id: parseInt(activeId),
                    userId,
                },
            });

            if (!active) {
                throw new Error(
                    'Active não encontrado ou não pertence ao usuário',
                );
            }

            const historicalBalances = await prisma.historicalBalance.findMany({
                where: { activeId: parseInt(activeId) },
                orderBy: { date: 'asc' },
            });
            return historicalBalances;
        } catch (error) {
            console.error(error);
            throw new Error(
                'Erro ao buscar balanços históricos por activeId no banco de dados',
            );
        }
    }

    async findById(id, userId) {
        try {
            const historicalBalance = await prisma.historicalBalance.findUnique(
                {
                    where: { id: parseInt(id) },
                    include: {
                        active: true,
                    },
                },
            );

            if (
                !historicalBalance ||
                historicalBalance.active.userId !== userId
            ) {
                throw new Error(
                    'Balanço histórico não encontrado ou não pertence ao usuário',
                );
            }
            return historicalBalance;
        } catch (error) {
            console.error(error);
            throw new Error(
                'Erro ao buscar balanço histórico por ID no banco de dados',
            );
        }
    }

    async update(id, date, value, userId) {
        try {
            const existingBalance = await prisma.historicalBalance.findUnique({
                where: { id: parseInt(id) },
                include: { active: true },
            });

            if (!existingBalance || existingBalance.active.userId !== userId) {
                throw new Error(
                    'Balanço histórico não encontrado ou não pertence ao usuário',
                );
            }

            const updatedBalance = await prisma.historicalBalance.update({
                where: { id: parseInt(id) },
                data: {
                    date: date ? new Date(date) : undefined,
                    value: value ? parseFloat(value) : undefined,
                },
            });
            return updatedBalance;
        } catch (error) {
            console.error(error);
            throw new Error(
                'Erro ao atualizar balanço histórico no banco de dados',
            );
        }
    }

    async delete(id, userId) {
        try {
            const existingBalance = await prisma.historicalBalance.findUnique({
                where: { id: parseInt(id) },
                include: { active: true },
            });

            if (!existingBalance || existingBalance.active.userId !== userId) {
                throw new Error(
                    'Balanço histórico não encontrado ou não pertence ao usuário',
                );
            }

            await prisma.historicalBalance.delete({
                where: { id: parseInt(id) },
            });
        } catch (error) {
            console.error(error);
            throw new Error(
                'Erro ao deletar balanço histórico no banco de dados',
            );
        }
    }
}

export default new HistoricalBalanceRepository();
