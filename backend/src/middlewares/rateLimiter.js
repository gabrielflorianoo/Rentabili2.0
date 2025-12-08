import { rateLimit } from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import { getRedisClient } from '../../redisClient.js';

const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const RATE_LIMIT_MAX = 100;

const AUTH_WINDOW_MS = 5 * 60 * 1000;
const AUTH_MAX = 5;

let apiLimiter = null;
let authLimiterInstance = null;

function createLimiter(windowMs, max, prefix, message) {
    return rateLimit({
        windowMs,
        max,
        standardHeaders: 'draft-7',
        legacyHeaders: false,

        store: new RedisStore({
            client: apiLimiter.client,
            prefix: prefix,
        }),

        message: {
            error: message,
            limiter: true,
        },

        keyGenerator: (req, res) => req.ip,
    });
}

/**
 * Inicializa o Rate Limiter padrão e de autenticação com o Redis Store de forma assíncrona.
 * @returns {Promise<Function>} O middleware de Rate Limiting padrão.
 */
export async function initializeRateLimiter() {
    if (apiLimiter) {
        return apiLimiter;
    }

    try {
        const redisClient = await getRedisClient();

        const isMock =
            typeof redisClient.get === 'function' &&
            typeof redisClient.connect === 'undefined';

        if (isMock || process.env.USE_CACHE !== 'true') {
            console.warn(
                '⚠️ Rate Limiter is running on MemoryStore due to Mock Redis Client or disabled cache.',
            );

            apiLimiter = rateLimit({
                windowMs: RATE_LIMIT_WINDOW_MS,
                max: RATE_LIMIT_MAX,
                message: {
                    error: 'Too many requests, please try again later.',
                },
            });
            authLimiterInstance = rateLimit({
                windowMs: AUTH_WINDOW_MS,
                max: AUTH_MAX,
                message: {
                    error: 'Login locked. Too many failed attempts. Try again in 5 minutes.',
                },
            });

            return apiLimiter;
        }

        apiLimiter = rateLimit({
            windowMs: RATE_LIMIT_WINDOW_MS,
            max: RATE_LIMIT_MAX,
            standardHeaders: 'draft-7',
            legacyHeaders: false,

            store: new RedisStore({
                client: redisClient,
                prefix: 'rl:api:',
            }),

            message: {
                error: 'Too many requests, please try again after 15 minutes.',
                limiter: true,
            },

            keyGenerator: (req, res) => req.ip,
        });

        authLimiterInstance = rateLimit({
            windowMs: AUTH_WINDOW_MS,
            max: AUTH_MAX,
            standardHeaders: 'draft-7',
            legacyHeaders: false,

            store: new RedisStore({
                client: redisClient,
                prefix: 'rl:auth:',
            }),

            message: {
                error: 'Login locked. Too many failed attempts. Try again in 5 minutes.',
                limiter: true,
            },

            keyGenerator: (req, res) => req.ip,
        });

        console.log(
            `🛡️ Rate Limiter Initialized: API (${RATE_LIMIT_MAX}/${RATE_LIMIT_WINDOW_MS / 60000}m), AUTH (${AUTH_MAX}/${AUTH_WINDOW_MS / 60000}m).`,
        );
        return apiLimiter;
    } catch (error) {
        console.error(
            'FATAL: Could not initialize Redis Rate Limiter. Using memory fallback.',
            error,
        );

        apiLimiter = (req, res, next) => next();
        authLimiterInstance = (req, res, next) => next();

        return apiLimiter;
    }
}

/**
 * Função utilitária para obter o limitador de autenticação.
 * Deve ser chamado APENAS após initializeRateLimiter.
 */
export function getAuthLimiter() {
    if (!authLimiterInstance) {
        console.error(
            'Auth Limiter not initialized. Returning simple pass-through middleware.',
        );
        return (req, res, next) => next();
    }
    return authLimiterInstance;
}
