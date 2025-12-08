import performanceService from '../services/performanceService.js';

class PerformanceController {
    /**
     * Calcula ganho/perda para um ativo específico
     */
    async getGainLossPercentage(req, res) {
        const { activeId } = req.params;
        const { startDate, endDate } = req.query;
        const userId = req.userId;

        try {
            if (!activeId) {
                return res.status(400).json({ error: 'activeId é obrigatório' });
            }

            const result = await performanceService.calculateGainLossPercentage(
                parseInt(activeId),
                userId,
                startDate,
                endDate
            );

            return res.json(result);
        } catch (error) {
            console.error('PerformanceController - getGainLossPercentage:', error);
            return res.status(400).json({ error: error.message });
        }
    }

    /**
     * Retorna performance de todos os ativos
     */
    async getAllPerformance(req, res) {
        const { startDate, endDate } = req.query;
        const userId = req.userId;

        try {
            const result = await performanceService.getAllPerformance(
                userId,
                startDate,
                endDate
            );

            return res.json(result);
        } catch (error) {
            console.error('PerformanceController - getAllPerformance:', error);
            return res.status(400).json({ error: error.message });
        }
    }

    /**
     * Retorna performance de um ativo por períodos pré-definidos
     */
    async getPerformanceByPeriod(req, res) {
        const { activeId } = req.params;
        const userId = req.userId;

        try {
            if (!activeId) {
                return res.status(400).json({ error: 'activeId é obrigatório' });
            }

            const result = await performanceService.getPerformanceByPeriod(
                parseInt(activeId),
                userId
            );

            return res.json(result);
        } catch (error) {
            console.error('PerformanceController - getPerformanceByPeriod:', error);
            return res.status(400).json({ error: error.message });
        }
    }

    /**
     * Retorna top melhores e piores ativos
     */
    async getTopPerformers(req, res) {
        const { limit } = req.query;
        const userId = req.userId;

        try {
            const result = await performanceService.getTopPerformers(
                userId,
                limit ? parseInt(limit) : 5
            );

            return res.json(result);
        } catch (error) {
            console.error('PerformanceController - getTopPerformers:', error);
            return res.status(400).json({ error: error.message });
        }
    }

    /**
     * Retorna evolução da carteira ao longo do tempo
     */
    async getPortfolioEvolution(req, res) {
        const { months } = req.query;
        const userId = req.userId;

        try {
            const result = await performanceService.getPortfolioEvolution(
                userId,
                months ? parseInt(months) : 12
            );

            return res.json(result);
        } catch (error) {
            console.error('PerformanceController - getPortfolioEvolution:', error);
            return res.status(400).json({ error: error.message });
        }
    }

    /**
     * Retorna alocação de ativos por tipo
     */
    async getAllocationByType(req, res) {
        const userId = req.userId;

        try {
            const result = await performanceService.getAllocationByType(userId);

            return res.json(result);
        } catch (error) {
            console.error('PerformanceController - getAllocationByType:', error);
            return res.status(400).json({ error: error.message });
        }
    }

    /**
     * Retorna datas dos últimos saldos
     */
    async getLastBalanceDates(req, res) {
        const userId = req.userId;

        try {
            const result = await performanceService.getLastBalanceDates(userId);

            return res.json(result);
        } catch (error) {
            console.error('PerformanceController - getLastBalanceDates:', error);
            return res.status(400).json({ error: error.message });
        }
    }
}

export default new PerformanceController();
