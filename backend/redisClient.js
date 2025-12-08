import { createClient } from 'redis';
import RedisServer from 'redis-server';

let redisClient = null;
let redisLocalServer = null;
let clientPromise = null;
const REDIS_LOCAL_PORT = 6379;

async function startLocalRedisServer() {
    if (process.env.NODE_ENV === 'production' || redisLocalServer) {
        return;
    }

    try {
        console.log(
            `Starting local Redis server on port ${REDIS_LOCAL_PORT}...`,
        );
        redisLocalServer = new RedisServer(REDIS_LOCAL_PORT);
        await redisLocalServer.open();

        console.log(`Local Redis server is READY on port ${REDIS_LOCAL_PORT}.`);
    } catch (error) {
        if (String(error).includes('EADDRINUSE')) {
            console.log(
                `Redis port ${REDIS_LOCAL_PORT} already in use. Assuming server is running.`,
            );
        } else {
            console.error('Failed to start local Redis server:', error.message);
            throw new Error('Failed to connect or start Redis server.');
        }
    }
}

export async function getRedisClient() {
    if (clientPromise) {
        return clientPromise;
    }

    if (process.env.USE_CACHE !== 'true') {
        console.log('Redis Cache: DISABLED (using mock client)');
        return Promise.resolve({
            get: async () => null,
            setEx: async () => 'OK',
            del: async () => 1,
        });
    }

    clientPromise = (async () => {
        if (process.env.NODE_ENV !== 'production') {
            await startLocalRedisServer();
        }

        let redisUrl;
        if (process.env.NODE_ENV !== 'production') {
            redisUrl = `redis://localhost:${REDIS_LOCAL_PORT}`;
        } else {
            redisUrl =
                process.env.REDIS_URL ||
                `redis://localhost:${REDIS_LOCAL_PORT}`;
        }

        console.log(`Connecting to Redis at: ${redisUrl}`);

        redisClient = createClient({
            url: redisUrl,
            socket: {
                connectTimeout: 10000,
            },
        });

        redisClient.on('error', (err) =>
            console.error('Redis Client Error', err),
        );

        await redisClient.connect();

        console.log('Redis Cache: ENABLED and CONNECTED');
        return redisClient;
    })();

    return clientPromise;
}
