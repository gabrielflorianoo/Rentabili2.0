// backend/controllers/historicalBalanceController.js
import historicalBalanceService from '../services/historicalBalanceService.js';

// Create a new historical balance for an active
export async function createHistoricalBalance(req, res) {
    const { date, value, activeId } = req.body;
    const userId = req.userId;

    try {
        const historicalBalance =
            await historicalBalanceService.createHistoricalBalance(
                date,
                value,
                activeId,
                userId,
            );
        res.status(201).json(historicalBalance);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

// Get all historical balances for a specific active
export async function getHistoricalBalancesByActive(req, res) {
    const { activeId } = req.params;
    const userId = req.userId;

    try {
        const historicalBalances =
            await historicalBalanceService.getHistoricalBalancesByActive(
                activeId,
                userId,
            );
        res.status(200).json(historicalBalances);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

// Get a single historical balance by ID
export async function getHistoricalBalanceById(req, res) {
    const { id } = req.params;
    const userId = req.userId;

    try {
        const historicalBalance =
            await historicalBalanceService.getHistoricalBalanceById(id, userId);
        res.status(200).json(historicalBalance);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

// Update a historical balance
export async function updateHistoricalBalance(req, res) {
    const { id } = req.params;
    const { date, value } = req.body;
    const userId = req.userId;

    try {
        const historicalBalance =
            await historicalBalanceService.updateHistoricalBalance(
                id,
                date,
                value,
                userId,
            );
        res.status(200).json(historicalBalance);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

// Delete a historical balance
export async function deleteHistoricalBalance(req, res) {
    const { id } = req.params;
    const userId = req.userId;

    try {
        await historicalBalanceService.deleteHistoricalBalance(id, userId);
        res.status(204).send();
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}
