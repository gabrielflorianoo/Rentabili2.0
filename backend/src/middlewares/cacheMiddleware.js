import { getRedisClient } from '../../redisClient.js';

export const cacheMiddleware = (keyPrefix, durationTTL = 3600) => {
    return async (req, res, next) => {
        const redis = await getRedisClient();

        const userId = req.user?.userId;
        if (!userId) {
            return next();
        }

        const cacheKey = `${keyPrefix}:${userId}`;

        try {
            const cachedData = await redis.get(cacheKey);

            if (cachedData) {
                console.log(`Cache HIT for key: ${cacheKey}`);

                return res.json(JSON.parse(cachedData));
            } else {
                console.log(`Cache MISS for key: ${cacheKey}`);

                res.sendResponse = res.json;
                res.json = async (body) => {
                    const dataToCache = JSON.stringify(body);

                    await redis.setEx(cacheKey, durationTTL, dataToCache);
                    res.sendResponse(body);
                };
                next();
            }
        } catch (error) {
            console.error('Redis Cache Error (skipping cache)', error);

            next();
        }
    };
};

export const invalidateCache = (keyPrefix) => {
    return async (req, res, next) => {
        const redis = await getRedisClient();

        const userId = req.user?.userId;
        if (!userId) {
            return next();
        }

        const cacheKey = `${keyPrefix}:${userId}`;

        try {
            await redis.del(cacheKey);
            console.log(`Cache INVALIDATED for key: ${cacheKey}`);
            next();
        } catch (error) {
            console.error(
                'Redis Invalidation Error (skipping invalidation)',
                error,
            );
            next();
        }
    };
};
