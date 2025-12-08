import InvestmentService from '../services/investmentService.js';

class InvestmentController {
    constructor() {
        this.investments = [
            {
                id: 1,
                amount: 1000,
                activeId: 1,
                userId: 1,
                date: new Date(),
                createdAt: new Date(),
                updatedAt: new Date(),
                kind: 'Investimento',
            },
            {
                id: 2,
                amount: 2000,
                activeId: 2,
                userId: 1,
                date: new Date(),
                createdAt: new Date(),
                updatedAt: new Date(),
                kind: 'Investimento',
            },
        ];

        this.getAll = this.getAll.bind(this);
        this.getById = this.getById.bind(this);
        this.create = this.create.bind(this);
        this.update = this.update.bind(this);
        this.remove = this.remove.bind(this);
        this.getTotalInvested = this.getTotalInvested.bind(this);
        this.getGainLoss = this.getGainLoss.bind(this);
        this.getDifferentActivesCount = this.getDifferentActivesCount.bind(this);
    }

    // Helper to parse amount, handling different formats
    parseAmount(val) {
        if (val === null || val === undefined) return 0;
        if (typeof val === 'number') return val;
        const s = String(val).trim();
        if (s === '') return 0;
        try {
            if (s.indexOf(',') > -1 && s.indexOf('.') > -1) {
                return parseFloat(s.replace(/\./g, '').replace(',', '.')) || 0;
            }
            if (s.indexOf(',') > -1 && s.indexOf('.') === -1) {
                return parseFloat(s.replace(',', '.')) || 0;
            }
            return parseFloat(s) || 0;
        } catch (e) {
            return 0;
        }
    }

    async getAll(req, res) {
        try {
            const userId = req.userId;
            if (!userId) {
                return res
                    .status(401)
                    .json({ error: 'Usuário não autenticado' });
            }
            const investments = await InvestmentService.getAll(userId);
            res.json(investments);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async getTotalInvested(req, res) {
        try {
            const userId = req.userId;
            if (!userId) {
                return res
                    .status(401)
                    .json({ error: 'Usuário não autenticado' });
            }
            const totalInvested =
                await InvestmentService.getTotalInvested(userId);
            res.json({ totalInvested });
        } catch (error) {
            console.error('Erro ao buscar total investido:', error);
            res.status(500).json({ error: error.message });
        }
    }

    async getGainLoss(req, res) {
        try {
            const userId = req.userId;
            if (!userId) {
                return res
                    .status(401)
                    .json({ error: 'Usuário não autenticado' });
            }
            const gainLoss = await InvestmentService.getGainLoss(userId);
            res.json({ gainLoss });
        } catch (error) {
            console.error('Erro ao buscar ganho/perda:', error);
            res.status(500).json({ error: error.message });
        }
    }

    async getDifferentActivesCount(req, res) {
        try {
            const userId = req.userId;
            if (!userId) {
                return res
                    .status(401)
                    .json({ error: 'Usuário não autenticado' });
            }
            const count =
                await InvestmentService.getDifferentActivesCount(userId);
            res.json({ count });
        } catch (error) {
            console.error('Erro ao buscar número de ativos diferentes:', error);
            res.status(500).json({ error: error.message });
        }
    }

    async getById(req, res) {
        try {
            const id = req.params.id;
            const investment = await InvestmentService.getById(id);
            if (!investment) {
                return res
                    .status(404)
                    .json({ error: 'Investimento não encontrado' });
            }
            res.json(investment);
        } catch (error) {
            console.error('Erro ao buscar investimento por ID:', error);
            res.status(500).json({ error: error.message });
        }
    }

    async create(req, res) {
        try {
            const { amount, activeId, date, kind } = req.body;
            const userId = req.userId;
            if (!userId) {
                return res
                    .status(400)
                    .json({ error: 'Usuário não autenticado' });
            }
            const newInvestment = await InvestmentService.create(
                amount,
                activeId,
                date,
                kind,
                userId,
            );
            res.status(201).json(newInvestment);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async update(req, res) {
        try {
            const id = Number(req.params.id);
            const { amount, activeId, date, kind } = req.body;
            const userId = req.userId;
            if (!userId) {
                return res
                    .status(400)
                    .json({ error: 'Usuário não autenticado' });
            }
            const updatedInvestment = await InvestmentService.update(
                id,
                amount,
                activeId,
                date,
                kind,
                userId,
            );
            res.json(updatedInvestment);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async remove(req, res) {
        try {
            const id = Number(req.params.id);
            const userId = req.userId;
            await InvestmentService.remove(id, userId);
            res.status(204).send();
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async simulateInvestment(req, res) {
        const { initialAmount, taxRate, periodMonths, monthlyContribution } =
            req.body;

        const result = await InvestmentService.simulateInvestment(
            initialAmount,
            taxRate,
            periodMonths,
            monthlyContribution,
        );

        res.json(result);
    }
}

export default InvestmentController;
