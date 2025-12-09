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
            // Use a transaction to ensure atomicity
            const newTransaction = await prisma.$transaction(async (tx) => {
                // Create the transaction
                const transaction = await tx.transaction.create({
                    data: {
                        amount,
                        type,
                        description,
                        date,
                        userId,
                        walletId,
                    },
                });

                // Update wallet balance if walletId is provided
                if (walletId) {
                    const wallet = await tx.wallet.findUnique({
                        where: { id: walletId },
                    });

                    if (!wallet) {
                        throw new Error('Carteira não encontrada');
                    }

                    // Calculate new balance based on transaction type
                    const balanceChange = type === 'income' ? amount : -amount;
                    const newBalance = parseFloat(wallet.balance) + balanceChange;

                    await tx.wallet.update({
                        where: { id: walletId },
                        data: { balance: newBalance },
                    });
                }

                return transaction;
            });

            return newTransaction;
        } catch (error) {
            console.error(error);
            throw new Error('Erro ao criar transação no banco de dados: ' + error.message);
        }
    }

    async update(id, amount, type, description, date, userId, walletId) {
        try {
            const updatedTransaction = await prisma.$transaction(async (tx) => {
                // Get the old transaction to revert its effect on wallet balance
                const oldTransaction = await tx.transaction.findUnique({
                    where: { id },
                });

                if (!oldTransaction) {
                    throw new Error('Transação não encontrada');
                }

                // Update the transaction
                const transaction = await tx.transaction.update({
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

                // Revert old wallet balance change
                if (oldTransaction.walletId) {
                    const oldWallet = await tx.wallet.findUnique({
                        where: { id: oldTransaction.walletId },
                    });

                    if (oldWallet) {
                        const oldBalanceChange = oldTransaction.type === 'income' 
                            ? oldTransaction.amount 
                            : -oldTransaction.amount;
                        const revertedBalance = parseFloat(oldWallet.balance) - oldBalanceChange;

                        await tx.wallet.update({
                            where: { id: oldTransaction.walletId },
                            data: { balance: revertedBalance },
                        });
                    }
                }

                // Apply new wallet balance change
                if (walletId) {
                    const newWallet = await tx.wallet.findUnique({
                        where: { id: walletId },
                    });

                    if (newWallet) {
                        const newBalanceChange = type === 'income' ? amount : -amount;
                        const updatedBalance = parseFloat(newWallet.balance) + newBalanceChange;

                        await tx.wallet.update({
                            where: { id: walletId },
                            data: { balance: updatedBalance },
                        });
                    }
                }

                return transaction;
            });

            return updatedTransaction;
        } catch (error) {
            console.error(error);
            throw new Error('Erro ao atualizar transação no banco de dados: ' + error.message);
        }
    }

    async remove(id) {
        try {
            await prisma.$transaction(async (tx) => {
                // Get the transaction to revert its effect on wallet balance
                const transaction = await tx.transaction.findUnique({
                    where: { id },
                });

                if (!transaction) {
                    throw new Error('Transação não encontrada');
                }

                // Revert wallet balance change
                if (transaction.walletId) {
                    const wallet = await tx.wallet.findUnique({
                        where: { id: transaction.walletId },
                    });

                    if (wallet) {
                        const balanceChange = transaction.type === 'income' 
                            ? transaction.amount 
                            : -transaction.amount;
                        const revertedBalance = parseFloat(wallet.balance) - balanceChange;

                        await tx.wallet.update({
                            where: { id: transaction.walletId },
                            data: { balance: revertedBalance },
                        });
                    }
                }

                // Delete the transaction
                await tx.transaction.delete({ where: { id } });
            });
        } catch (error) {
            console.error(error);
            throw new Error('Erro ao deletar transação no banco de dados: ' + error.message);
        }
    }
}

export default new TransactionRepository();
