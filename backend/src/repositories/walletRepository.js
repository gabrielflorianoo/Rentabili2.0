// backend/src/repositories/walletRepository.js
import getPrismaClient from '../../prismaClient.js';
const prisma = getPrismaClient();

class WalletRepository {
    async findAll(userId) {
        try {
            return await prisma.wallet.findMany({
                where: { userId },
            });
        } catch (error) {
            console.error(error);
            throw new Error('Erro ao buscar carteiras no banco de dados');
        }
    }

    async findById(id) {
        try {
            return await prisma.wallet.findUnique({
                where: { id },
            });
        } catch (error) {
            console.error(error);
            throw new Error('Erro ao buscar carteira por ID no banco de dados');
        }
    }

    async create(name, balance, userId) {
        try {
            const newWallet = await prisma.wallet.create({
                data: {
                    name,
                    balance,
                    userId,
                },
            });
            return newWallet;
        } catch (error) {
            console.error(error);
            throw new Error('Erro ao criar carteira no banco de dados');
        }
    }

    async update(id, name, balance, userId) {
        try {
            const updatedWallet = await prisma.wallet.update({
                where: { id },
                data: {
                    name,
                    balance,
                    userId,
                },
            });
            return updatedWallet;
        } catch (error) {
            console.error(error);
            throw new Error('Erro ao atualizar carteira no banco de dados');
        }
    }

    async remove(id) {
        try {
            await prisma.wallet.delete({ where: { id } });
        } catch (error) {
            console.error(error);
            throw new Error('Erro ao deletar carteira no banco de dados');
        }
    }
}

export default new WalletRepository();
