import getPrismaClient from '../../prismaClient.js';

const prisma = getPrismaClient();

class ActiveRepository {
    async create(name, type, userId) {
        try {
            const active = await prisma.active.create({
                data: {
                    name,
                    type,
                    userId,
                },
            });
            return active;
        } catch (error) {
            console.error(error);
            throw new Error('Erro ao criar active no banco de dados');
        }
    }

    async findAll(userId) {
        try {
            const actives = await prisma.active.findMany({
                where: { userId },
                include: {
                    investments: true,
                },
            });
            return actives;
        } catch (error) {
            console.error(error);
            throw new Error('Erro ao buscar actives no banco de dados');
        }
    }

    async findById(id, userId) {
        try {
            const active = await prisma.active.findFirst({
                where: {
                    id: parseInt(id),
                    userId,
                },
                include: {
                    investments: true,
                },
            });
            
            if (!active) {
                throw new Error('Ativo não encontrado');
            }
            
            return active;
        } catch (error) {
            console.error(error);
            throw new Error(error.message || 'Erro ao buscar active por ID no banco de dados');
        }
    }

    async update(id, name, type, userId) {
        try {
            const active = await prisma.active.update({
                where: {
                    id: parseInt(id),
                    userId,
                },
                data: {
                    name,
                    type,
                },
            });
            return active;
        } catch (error) {
            console.error(error);
            throw new Error('Erro ao atualizar active no banco de dados');
        }
    }

    async delete(id, userId) {
        try {
            // 1. DELETE Investments
            await prisma.investment.deleteMany({
                where: { activeId: parseInt(id) },
            });

            // 2. DELETE the Active
            await prisma.active.delete({
                where: {
                    id: parseInt(id),
                    userId,
                },
            });
        } catch (error) {
            console.error(error);
            throw new Error('Erro ao deletar active no banco de dados');
        }
    }
}

export default new ActiveRepository();
