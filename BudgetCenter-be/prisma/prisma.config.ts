const fs = require('fs');
const path = require('path');

const envPath = [
  path.resolve(__dirname, '../.env'),
  path.resolve(__dirname, '../src/.env'),
].find((candidate) => fs.existsSync(candidate));

if (envPath) {
  require('dotenv').config({ path: envPath });
}

export default {
  schema: "schema.prisma",
  migrations: {
    path: "migrations",
  },
  datasource: {
    url: process.env.DATABASE_URL,
  },
};