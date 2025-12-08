import pkg from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const { sign, verify } = pkg;

const generateAccessToken = (userId) => {
    return sign({ userId }, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: process.env.ACCESS_TOKEN_EXP || '15m',
    });
};

const generateRefreshToken = (userId) => {
    return sign({ userId }, process.env.REFRESH_TOKEN_SECRET, {
        expiresIn: process.env.REFRESH_TOKEN_EXP || '7d',
    });
};

const storeRefreshToken = async (token, userId) => {
    try {
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7); // Refresh token expires in 7 days

        await prisma.refreshToken.create({
            data: {
                token,
                userId: parseInt(userId),
                expiresAt,
            },
        });
    } catch (error) {
        console.error('Error storing refresh token:', error);
        throw error;
    }
};

const rotateRefreshToken = async (oldRefreshToken) => {
    try {
        const decoded = verify(
            oldRefreshToken,
            process.env.REFRESH_TOKEN_SECRET,
        );
        const userId = decoded.userId;

        // Revoke old refresh token
        await prisma.refreshToken.update({
            where: {
                token: oldRefreshToken,
            },
            data: {
                revoked: true,
            },
        });

        // Generate new tokens
        const accessToken = generateAccessToken(userId);
        const refreshToken = generateRefreshToken(userId);

        // Store new refresh token
        await storeRefreshToken(refreshToken, userId);

        return { accessToken, refreshToken };
    } catch (error) {
        console.error('Error rotating refresh token:', error);
        throw error;
    }
};

const revokeRefreshToken = async (refreshToken) => {
    try {
        await prisma.refreshToken.update({
            where: {
                token: refreshToken,
            },
            data: {
                revoked: true,
            },
        });
    } catch (error) {
        console.error('Error revoking refresh token:', error);
        throw error;
    }
};

export {
    generateAccessToken,
    generateRefreshToken,
    storeRefreshToken,
    rotateRefreshToken,
    revokeRefreshToken,
};
