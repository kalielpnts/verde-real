const { PrismaClient } = require('@prisma/client');

// Instância única do Prisma reutilizada em todo o backend
const prisma = new PrismaClient();

module.exports = prisma;
