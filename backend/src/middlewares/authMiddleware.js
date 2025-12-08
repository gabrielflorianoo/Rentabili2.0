import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

export const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.sendStatus(401);
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            console.error('4. ERRO JWT. Status 403. Mensagem:', err.message); // <--- MUITO IMPORTANTE!
            return res.sendStatus(403);
        }

        req.userId = user.userId; // Disponibiliza o userId para os controllers
        req.user = { userId: user.userId, id: user.userId }; // Garante compatibilidade com cacheMiddleware
        next();
    });
};
