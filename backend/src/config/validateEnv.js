import Joi from 'joi';

// Durante build/install, algumas variáveis podem não estar disponíveis
const isBuildTime = process.env.npm_lifecycle_event === 'postinstall' || 
                    process.env.npm_lifecycle_event === 'install' ||
                    process.env.npm_lifecycle_event === 'build';

const envSchema = Joi.object({
    PORT: Joi.number().default(3001),
    DATABASE_URL: isBuildTime ? Joi.string().optional() : Joi.string().required(),
    JWT_SECRET: isBuildTime ? Joi.string().default('dev_secret') : Joi.string().required(),
    ACCESS_TOKEN_EXP: Joi.string().default('15m'),
    REFRESH_TOKEN_EXP: Joi.string().default('7d'),
    FRONTEND_URL: isBuildTime ? Joi.string().default('http://localhost:5173') : Joi.string().required(),
    REDIS_URL: isBuildTime ? Joi.string().default('redis://localhost:6379') : Joi.string().required(),
    NODE_ENV: Joi.string()
        .valid('development', 'production', 'test')
        .default('development'),
})
    .unknown()
    .required();

function validateEnv() {
    const { error, value: envVars } = envSchema.validate(process.env);

    if (error && !isBuildTime) {
        throw new Error(`Config validation error: ${error.message}`);
    }

    return envVars;
}

export default validateEnv;
