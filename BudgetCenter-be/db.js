const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const { PrismaMariaDb } = require('@prisma/adapter-mariadb');

const envPath = [
  path.resolve(__dirname, '.env'),
  path.resolve(__dirname, 'src/.env'),
].find((candidate) => fs.existsSync(candidate));

if (envPath) {
  require('dotenv').config({ path: envPath });
}

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set.');
}

const adapter = new PrismaMariaDb(process.env.DATABASE_URL);

const prisma = new PrismaClient({
  adapter,
  log: ['query', 'info', 'warn', 'error'],
});

module.exports = prisma;