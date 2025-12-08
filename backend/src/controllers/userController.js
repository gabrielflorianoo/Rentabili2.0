// backend/controllers/userController.js
import userService from '../services/userService.js';
import bcrypt from 'bcryptjs';

class UserController {
    constructor() {
        this.users = [
            {
                id: 1,
                name: 'Usuário Local',
                email: 'local@example.com',
                // Removido phone para compatibilidade
                password: 'localpassword',
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
            const users = await userService.getAll();
            res.json(users);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async getById(req, res) {
        try {
            const id = Number(req.params.id);
            const user = await userService.getById(id);
            if (user) {
                res.json({
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    createdAt: user.createdAt,
                });
            } else {
                res.status(404).json({ error: 'Usuário não encontrado' });
            }
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async create(req, res) {
        try {
            const { name, email, password } = req.body;
            const newUser = await userService.create(name, email, password);
            res.status(201).json(newUser);
        } catch (error) {
            if (error.code === 'P2002') {
                return res.status(400).json({ error: 'Email já cadastrado' });
            }
            res.status(500).json({ error: error.message });
        }
    }

    async update(req, res) {
        try {
            const id = Number(req.params.id);
            const { name, email } = req.body;
            const updatedUser = await userService.update(id, name, email);
            res.json(updatedUser);
        } catch (error) {
            if (error.code === 'P2025') {
                return res
                    .status(404)
                    .json({ error: 'Usuário não encontrado' });
            }
            res.status(500).json({ error: error.message });
        }
    }

    async remove(req, res) {
        try {
            const id = Number(req.params.id);
            await userService.remove(id);
            res.status(204).send();
        } catch (error) {
            if (error.code === 'P2025') {
                return res
                    .status(404)
                    .json({ error: 'Usuário não encontrado' });
            }
            // Erro de restrição de chave estrangeira (usuário tem dados)
            if (error.code === 'P2003') {
                return res.status(400).json({
                    error: 'O usuário possui dados associados (ativos, carteiras, etc.) e não pode ser excluído diretamente.',
                });
            }
            res.status(500).json({ error: error.message });
        }
    }
}

export default UserController;
