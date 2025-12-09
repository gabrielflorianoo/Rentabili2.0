// backend/src/repositories/transactionRepository.js
import getPrismaClient from '../../prismaClient.js';
const prisma = getPrismaClient();

class TransactionRepository {
    async findAll(userId) {
        try {
            return await prisma.transaction.findMany({
                where: { userId },
                orderBy: { date: 'desc' },
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
            // Simply create the transaction without modifying wallet balance
            // Balance is now calculated dynamically from transactions
            const transaction = await prisma.transaction.create({
                data: {
                    amount,
                    type,
                    description,
                    date,
                    userId,
                    walletId,
                },
            });

            return transaction;
        } catch (error) {
            console.error(error);
            throw new Error('Erro ao criar transação no banco de dados: ' + error.message);
        }
    }

    async update(id, amount, type, description, date, userId, walletId) {
        try {
            // Simply update the transaction without modifying wallet balance
            // Balance is now calculated dynamically from transactions
            const transaction = await prisma.transaction.update({
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

            return transaction;
        } catch (error) {
            console.error(error);
            throw new Error('Erro ao atualizar transação no banco de dados: ' + error.message);
        }
    }

    async remove(id) {
        try {
            // Simply delete the transaction without modifying wallet balance
            // Balance is now calculated dynamically from transactions
            await prisma.transaction.delete({ where: { id } });
        } catch (error) {
            console.error(error);
            throw new Error('Erro ao deletar transação no banco de dados: ' + error.message);
        }
    }
}

export default new TransactionRepository();
