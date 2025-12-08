// backend/src/services/walletService.js
import walletRepository from '../repositories/walletRepository.js';

class WalletService {
    async getAll(userId) {
        try {
            if (!userId) {
                throw new Error('Usuário não autenticado');
            }
            const wallets = await walletRepository.findAll(userId);
            return wallets;
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
            const wallet = await walletRepository.findById(id);
            if (!wallet) {
                throw new Error('Carteira não encontrada');
            }
            return wallet;
        } catch (error) {
            console.error(error);
            throw new Error(error.message);
        }
    }

    async create(name, balance, userId) {
        try {
            if (!name || !userId) {
                throw new Error('Nome e userId são obrigatórios');
            }
            const newWallet = await walletRepository.create(
                name,
                balance,
                userId,
            );
            return newWallet;
        } catch (error) {
            console.error(error);
            throw new Error(error.message);
        }
    }

    async update(id, name, balance, userId) {
        try {
            if (!id || !userId) {
                throw new Error('ID e userId são obrigatórios');
            }
            const updatedWallet = await walletRepository.update(
                id,
                name,
                balance,
                userId,
            );
            return updatedWallet;
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
            await walletRepository.remove(id);
        } catch (error) {
            console.error(error);
            throw new Error(error.message);
        }
    }
}

export default new WalletService();
