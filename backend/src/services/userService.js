// backend/src/services/userService.js
import userRepository from '../repositories/userRepository.js';
import bcrypt from 'bcryptjs';

class UserService {
    async getAll() {
        try {
            const users = await userRepository.findAll();
            return users;
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
            const user = await userRepository.findById(id);
            if (!user) {
                throw new Error('Usuário não encontrado');
            }
            return user;
        } catch (error) {
            console.error(error);
            throw new Error(error.message);
        }
    }

    async create(name, email, password) {
        try {
            if (!name || !email || !password) {
                throw new Error('name, email e password são obrigatórios');
            }
            const hashedPassword = await bcrypt.hash(password, 10);
            const newUser = await userRepository.create(
                name,
                email,
                hashedPassword,
            );
            return newUser;
        } catch (error) {
            console.error(error);
            throw new Error(error.message);
        }
    }

    async update(id, name, email) {
        try {
            if (!id) {
                throw new Error('ID é obrigatório');
            }
            const updatedUser = await userRepository.update(id, name, email);
            if (!updatedUser) {
                throw new Error('Usuário não encontrado');
            }
            return updatedUser;
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
            await userRepository.remove(id);
        } catch (error) {
            console.error(error);
            throw new Error(error.message);
        }
    }
}

export default new UserService();
