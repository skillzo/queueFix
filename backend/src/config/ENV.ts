export const ENV = {
  APP: {
    PORT: process.env.PORT || 3000,
  },
  DB: {
    HOST: process.env.DB_HOST || "localhost",
    PORT: process.env.DB_PORT || 5432,
    USERNAME: process.env.DB_USERNAME || "postgres",
    PASSWORD: process.env.DB_PASSWORD || "123456",
    NAME: process.env.DB_NAME || "queue_fix",
  },
  JWT: {
    SECRET: process.env.JWT_SECRET || "secret",
  },
};
