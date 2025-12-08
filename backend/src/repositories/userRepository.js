// backend/src/repositories/userRepository.js
import getPrismaClient from '../../prismaClient.js';
const prisma = getPrismaClient();

class UserRepository {
    async findAll() {
        try {
            const users = await prisma.user.findMany({
                select: {
                    id: true,
                    name: true,
                    email: true,
                    createdAt: true,
                },
            });
            return users;
        } catch (error) {
            console.error(error);
            throw new Error('Erro ao buscar usuários no banco de dados');
        }
    }

    async findById(id) {
        try {
            const user = await prisma.user.findUnique({
                where: { id },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    createdAt: true,
                },
            });
            return user;
        } catch (error) {
            console.error(error);
            throw new Error('Erro ao buscar usuário por ID no banco de dados');
        }
    }

    async create(name, email, password) {
        try {
            const newUser = await prisma.user.create({
                data: {
                    name,
                    email,
                    password,
                },
            });
            const { password: _, ...userWithoutPassword } = newUser;
            return userWithoutPassword;
        } catch (error) {
            console.error(error);
            throw new Error('Erro ao criar usuário no banco de dados');
        }
    }

    async update(id, name, email) {
        try {
            const updatedUser = await prisma.user.update({
                where: { id },
                data: { name, email },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    createdAt: true,
                },
            });
            return updatedUser;
        } catch (error) {
            console.error(error);
            throw new Error('Erro ao atualizar usuário no banco de dados');
        }
    }

    async remove(id) {
        try {
            await prisma.user.delete({
                where: { id },
            });
        } catch (error) {
            console.error(error);
            throw new Error('Erro ao deletar usuário no banco de dados');
        }
    }
}

export default new UserRepository();
