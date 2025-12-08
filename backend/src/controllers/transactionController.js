// backend/controllers/transactionController.js
import transactionService from '../services/transactionService.js';

class TransactionController {
    constructor() {
        this.transactions = [
            {
                id: 1,
                amount: 500,
                type: 'income',
                description: 'Depósito inicial',
                date: new Date(),
                userId: 1,
                walletId: 1,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                id: 2,
                amount: 1000,
                type: 'expense',
                description: 'Compra de ações',
                date: new Date(),
                userId: 1,
                walletId: 1,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        ];

        this.getAll = this.getAll.bind(this);
        this.getById = this.getById.bind(this);
        this.create = this.create.bind(this);
        this.update = this.update.bind(this);
        this.remove = this.remove.bind(this);
    }

    async getAll(req, res) {
        try {
            const userId = req.userId;
            if (!userId) {
                return res
                    .status(401)
                    .json({ error: 'Usuário não autenticado' });
            }
            const transactions = await transactionService.getAll(userId);
            res.json(transactions);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async getById(req, res) {
        try {
            const id = Number(req.params.id);
            const transaction = await transactionService.getById(id);
            if (!transaction)
                return res
                    .status(404)
                    .json({ error: 'Transação não encontrada' });
            res.json(transaction);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async create(req, res) {
        try {
            const { amount, type, description, date, walletId } = req.body;
            const userId = req.userId;
            const newTransaction = await transactionService.create(
                amount,
                type,
                description,
                date,
                userId,
                walletId,
            );
            res.status(201).json(newTransaction);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async update(req, res) {
        try {
            const id = Number(req.params.id);
            const { amount, type, description, date, walletId } = req.body;
            const userId = req.userId;
            const updatedTransaction = await transactionService.update(
                id,
                amount,
                type,
                description,
                date,
                userId,
                walletId,
            );
            res.json(updatedTransaction);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async remove(req, res) {
        try {
            const id = Number(req.params.id);
            await transactionService.remove(id);
            res.status(204).send();
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}

export default TransactionController;
