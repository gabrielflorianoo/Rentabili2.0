// backend/src/services/historicalBalanceService.js
import historicalBalanceRepository from '../repositories/historicalBalanceRepository.js';

class HistoricalBalanceService {
    async createHistoricalBalance(date, value, activeId, userId) {
        try {
            if (!date || !value || !activeId || !userId) {
                throw new Error(
                    'Data, valor, activeId e userId são obrigatórios',
                );
            }
            const historicalBalance = await historicalBalanceRepository.create(
                date,
                value,
                activeId,
                userId,
            );
            return historicalBalance;
        } catch (error) {
            console.error(error);
            throw new Error(error.message);
        }
    }

    async getHistoricalBalancesByActive(activeId, userId) {
        try {
            if (!activeId || !userId) {
                throw new Error('activeId e userId são obrigatórios');
            }
            const historicalBalances =
                await historicalBalanceRepository.findByActiveId(
                    activeId,
                    userId,
                );
            return historicalBalances;
        } catch (error) {
            console.error(error);
            throw new Error(error.message);
        }
    }

    async getHistoricalBalanceById(id, userId) {
        try {
            if (!id || !userId) {
                throw new Error('id e userId são obrigatórios');
            }
            const historicalBalance =
                await historicalBalanceRepository.findById(id, userId);
            if (!historicalBalance) {
                throw new Error('Balanço histórico não encontrado');
            }
            return historicalBalance;
        } catch (error) {
            console.error(error);
            throw new Error(error.message);
        }
    }

    async updateHistoricalBalance(id, date, value, userId) {
        try {
            if (!id || !userId) {
                throw new Error('id e userId são obrigatórios');
            }
            const updatedBalance = await historicalBalanceRepository.update(
                id,
                date,
                value,
                userId,
            );
            return updatedBalance;
        } catch (error) {
            console.error(error);
            throw new Error(error.message);
        }
    }

    async deleteHistoricalBalance(id, userId) {
        try {
            if (!id || !userId) {
                throw new Error('id e userId são obrigatórios');
            }
            await historicalBalanceRepository.delete(id, userId);
        } catch (error) {
            console.error(error);
            throw new Error(error.message);
        }
    }
}

export default new HistoricalBalanceService();
