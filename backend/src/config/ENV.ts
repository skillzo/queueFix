export const ENV = {
  APP: {
    PORT: process.env.PORT || 3000,
    FRONTEND_URL: process.env.FRONTEND_URL || "http://localhost:5173",
  },

  DB: {
    HOST: process.env.DB_HOST || "localhost",
    PORT: process.env.DB_PORT || 5432,
    USERNAME: process.env.DB_USERNAME || "postgres",
    PASSWORD: process.env.DB_PASSWORD || "postgres",
    NAME: process.env.DB_NAME || "queue_fix",
  },

  JWT: {
    SECRET: process.env.JWT_SECRET || "secret",
  },

  REDIS: {
    HOST: process.env.REDIS_HOST || "localhost",
    PORT: parseInt(process.env.REDIS_PORT || "6379"),
    PASSWORD: process.env.REDIS_PASSWORD || undefined,
  },
};
