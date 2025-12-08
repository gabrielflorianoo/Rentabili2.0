import Joi from 'joi';

const envSchema = Joi.object({
    PORT: Joi.number().default(3001),
    DATABASE_URL: Joi.string().required(),
    JWT_SECRET: Joi.string().required(),
    ACCESS_TOKEN_EXP: Joi.string().default('15m'),
    REFRESH_TOKEN_EXP: Joi.string().default('7d'),
    FRONTEND_URL: Joi.string().required(),
    REDIS_URL: Joi.string().required(),
    NODE_ENV: Joi.string()
        .valid('development', 'production', 'test')
        .default('development'),
})
    .unknown()
    .required();

function validateEnv() {
    const { error, value: envVars } = envSchema.validate(process.env);

    if (error) {
        throw new Error(`Config validation error: ${error.message}`);
    }

    return envVars;
}

export default validateEnv;
