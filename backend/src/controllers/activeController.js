import activeService from '../services/activeService.js';

// Create a new active
export async function createActive(req, res) {
    const { name, type } = req.body;
    const userId = req.userId;

    try {
        if (!userId) {
            return res.status(400).json({ error: 'userId é obrigatório' });
        }
        const active = await activeService.createActive(name, type, userId);
        res.status(201).json(active);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

// Get all actives for a user
export async function getActives(req, res) {
    const userId = req.userId;

    try {
        const actives = await activeService.getActives(userId);
        res.status(200).json(actives);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

// Get a single active by ID
export async function getActiveById(req, res) {
    const { id } = req.params;
    const userId = req.userId;

    try {
        const active = await activeService.getActiveById(id, userId);

        res.status(200).json(active);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

// Update an active
export async function updateActive(req, res) {
    const { id } = req.params;
    const { name, type } = req.body;
    const userId = req.userId;

    try {
        const active = await activeService.updateActive(id, name, type, userId);
        res.status(200).json(active);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

// Delete an active
export async function deleteActive(req, res) {
    const { id } = req.params;
    const userId = req.userId;

    try {
        await activeService.deleteActive(id, userId);
        res.status(204).send();
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}
