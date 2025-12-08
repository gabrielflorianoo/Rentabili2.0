// backend/src/repositories/transactionRepository.js
import getPrismaClient from '../../prismaClient.js';
const prisma = getPrismaClient();

class TransactionRepository {
    async findAll(userId) {
        try {
            return await prisma.transaction.findMany({
                where: { userId },
            });
        } catch (error) {
            console.error(error);
            throw new Error('Erro ao buscar transações no banco de dados');
        }
    }

    async findById(id) {
        try {
            return await prisma.transaction.findUnique({
                where: { id },
            });
        } catch (error) {
            console.error(error);
            throw new Error(
                'Erro ao buscar transação por ID no banco de dados',
            );
        }
    }

    async create(amount, type, description, date, userId, walletId) {
        try {
            const newTransaction = await prisma.transaction.create({
                data: {
                    amount,
                    type,
                    description,
                    date,
                    userId,
                    walletId,
                },
            });
            return newTransaction;
        } catch (error) {
            console.error(error);
            throw new Error('Erro ao criar transação no banco de dados');
        }
    }

    async update(id, amount, type, description, date, userId, walletId) {
        try {
            const updatedTransaction = await prisma.transaction.update({
                where: { id },
                data: {
                    amount,
                    type,
                    description,
                    date,
                    userId,
                    walletId,
                },
            });
            return updatedTransaction;
        } catch (error) {
            console.error(error);
            throw new Error('Erro ao atualizar transação no banco de dados');
        }
    }

    async remove(id) {
        try {
            await prisma.transaction.delete({ where: { id } });
        } catch (error) {
            console.error(error);
            throw new Error('Erro ao deletar transação no banco de dados');
        }
    }
}

export default new TransactionRepository();
