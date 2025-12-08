// backend/src/services/transactionService.js
import transactionRepository from '../repositories/transactionRepository.js';

class TransactionService {
    async getAll(userId) {
        try {
            if (!userId) {
                throw new Error('Usuário não autenticado');
            }
            const transactions = await transactionRepository.findAll(userId);
            return transactions;
        } catch (error) {
            console.error(error);
            throw new Error(error.message);
        }
    }

    async getById(id) {
        try {
            if (!id) {
                throw new Error('ID é obrigatório');
            }
            const transaction = await transactionRepository.findById(id);
            if (!transaction) {
                throw new Error('Transação não encontrada');
            }
            return transaction;
        } catch (error) {
            console.error(error);
            throw new Error(error.message);
        }
    }

    async create(amount, type, description, date, userId, walletId) {
        try {
            if (!amount || !type || !userId) {
                throw new Error('amount, type e userId são obrigatórios');
            }
            const newTransaction = await transactionRepository.create(
                amount,
                type,
                description,
                date,
                userId,
                walletId,
            );
            return newTransaction;
        } catch (error) {
            console.error(error);
            throw new Error(error.message);
        }
    }

    async update(id, amount, type, description, date, userId, walletId) {
        try {
            if (!id) {
                throw new Error('ID é obrigatório');
            }
            const updatedTransaction = await transactionRepository.update(
                id,
                amount,
                type,
                description,
                date,
                userId,
                walletId,
            );
            return updatedTransaction;
        } catch (error) {
            console.error(error);
            throw new Error(error.message);
        }
    }

    async remove(id) {
        try {
            if (!id) {
                throw new Error('ID é obrigatório');
            }
            await transactionRepository.remove(id);
        } catch (error) {
            console.error(error);
            throw new Error(error.message);
        }
    }
}

export default new TransactionService();
