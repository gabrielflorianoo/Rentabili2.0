import bcrypt from 'bcryptjs';
import getPrismaClient from '../../prismaClient.js';
import {
    generateAccessToken,
    generateRefreshToken,
    storeRefreshToken,
    rotateRefreshToken,
    revokeRefreshToken,
} from '../services/tokenService.js';

class AuthController {
    constructor() {
        this.login = this.login.bind(this);
        this.register = this.register.bind(this);
    }

    async register(req, res) {
        try {
            const { name, email, password } = req.body || {};
            if (!name || !email || !password) {
                return res
                    .status(400)
                    .json({ error: 'Nome, email e senha são obrigatórios' });
            }

            if (process.env.USE_DB !== 'true') {
                // Mock register
                return res.status(201).json({
                    message: 'Usuário registrado com sucesso (mock)',
                    user: { name, email },
                });
            }

            const prisma = getPrismaClient();

            const existingUser = await prisma.user.findUnique({
                where: { email },
            });
            if (existingUser) {
                return res.status(409).json({ error: 'Email já registrado' });
            }

            const hashedPassword = await bcrypt.hash(password, 10);

            const newUser = await prisma.user.create({
                data: {
                    name,
                    email,
                    password: hashedPassword,
                },
            });

            res.status(201).json({
                message: 'Usuário registrado com sucesso',
                user: {
                    id: newUser.id,
                    name: newUser.name,
                    email: newUser.email,
                },
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async login(req, res) {
        try {
            const { email, password } = req.body || {};
            if (!email || !password)
                return res
                    .status(400)
                    .json({ error: 'email e password são obrigatórios' });

            if (process.env.USE_DB !== 'true') {
                // Mock login
                if (
                    email === 'local@example.com' &&
                    password === 'localpassword'
                ) {
                    const payload = {
                        id: 1,
                        email: 'local@example.com',
                        name: 'Usuário Local',
                    };

                    const secret = process.env.JWT_SECRET;
                    const expiresIn = process.env.JWT_EXPIRES_IN || '15m';
                    const token = jwt.sign(payload, secret, {
                        expiresIn: expiresIn,
                    });
                    return res.json({ token, user: payload });
                } else {
                    return res
                        .status(401)
                        .json({ error: 'Credenciais inválidas' });
                }
            }

            const prisma = getPrismaClient();
            const user = await prisma.user.findUnique({ where: { email } });
            if (!user)
                return res.status(401).json({ error: 'Credenciais inválidas' });

            const match = await bcrypt.compare(password, user.password);
            if (!match)
                return res.status(401).json({ error: 'Credenciais inválidas' });

            const payload = { id: user.id, email: user.email, name: user.name };
            const accessToken = generateAccessToken(user.id);
            const refreshToken = generateRefreshToken(user.id);

            await storeRefreshToken(refreshToken, user.id);

            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                secure: true, // Defina como true em produção com HTTPS
                sameSite: 'strict',
            });

            res.json({ accessToken, user: payload });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async refresh(req, res) {
        try {
            const refreshToken = req.cookies.refreshToken;

            if (!refreshToken) {
                return res
                    .status(401)
                    .json({ error: 'Refresh token não encontrado' });
            }

            const { accessToken, refreshToken: newRefreshToken } =
                await rotateRefreshToken(refreshToken);

            res.cookie('refreshToken', newRefreshToken, {
                httpOnly: true,
                secure: true, // Defina como true em produção com HTTPS
                sameSite: 'strict',
            });

            res.json({ accessToken });
        } catch (error) {
            console.error('Erro ao atualizar o token:', error);
            res.status(401).json({ error: 'Refresh token inválido' });
        }
    }

    async logout(req, res) {
        try {
            const refreshToken = req.cookies.refreshToken;

            if (!refreshToken) {
                return res.status(204).send(); // No content, but successful
            }

            await revokeRefreshToken(refreshToken);

            res.clearCookie('refreshToken', {
                httpOnly: true,
                secure: true, // Defina como true em produção com HTTPS
                sameSite: 'strict',
            });

            res.status(204).send(); // No content, but successful
        } catch (error) {
            console.error('Erro ao fazer logout:', error);
            res.status(500).json({ error: 'Erro ao fazer logout' });
        }
    }
}

export default AuthController;
