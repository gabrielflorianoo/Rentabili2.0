import activeRepository from '../repositories/activeRepository.js';

class ActiveService {
    async createActive(name, type, userId) {
        try {
            console.log('createActive Service - name:', name, 'type:', type, 'userId:', userId);
            if (!name || !type) {
                throw new Error('Nome e tipo são obrigatórios');
            }
            // userId já é validado no controller
            const active = await activeRepository.create(name, type, userId);
            return active;
        } catch (error) {
            console.error(error);
            throw error; // Re-lançar o erro para o controller tratar
        }
    }

    async getActives(userId) {
        try {
            // userId já é validado no controller
            const actives = await activeRepository.findAll(userId);
            return actives;
        } catch (error) {
            console.error(error);
            throw error; // Re-lançar o erro para o controller tratar
        }
    }

    async getActiveById(id, userId) {
        try {
            if (!id) {
                throw new Error('id é obrigatório');
            }
            // userId já é validado no controller
            const active = await activeRepository.findById(id, userId);
            if (!active) {
                throw new Error('Active não encontrado');
            }
            return active;
        } catch (error) {
            console.error(error);
            throw error; // Re-lançar o erro para o controller tratar
        }
    }

    async updateActive(id, name, type, userId) {
        try {
            if (!id || !name || !type) {
                throw new Error('id, nome e tipo são obrigatórios');
            }
            // userId já é validado no controller
            const active = await activeRepository.update(
                id,
                name,
                type,
                userId,
            );
            return active;
        } catch (error) {
            console.error(error);
            throw error; // Re-lançar o erro para o controller tratar
        }
    }

    async deleteActive(id, userId) {
        try {
            if (!id) {
                throw new Error('id é obrigatório');
            }
            // userId já é validado no controller
            await activeRepository.delete(id, userId);
        } catch (error) {
            console.error(error);
            throw error; // Re-lançar o erro para o controller tratar
        }
    }
}

export default new ActiveService();
