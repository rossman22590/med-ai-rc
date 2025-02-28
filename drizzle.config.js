// drizzle.config.js
/** @type { import("drizzle-kit").Config } */
module.exports = {
  schema: './lib/db/schema.ts',
  out: './migrations',
  dialect: 'postgresql',
  dbCredentials: {
    // Use url instead of connectionString
    url: process.env.DATABASE_URL || '',
  },
};
