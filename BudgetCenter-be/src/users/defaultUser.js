const prisma = require('../../db.js');

const DEFAULT_USER_ID = 1;
const DEFAULT_USER_EMAIL = 'dev-user@budgetcenter.local';

async function ensureDefaultUser() {
    return prisma.user.upsert({
        where: { id: DEFAULT_USER_ID },
        update: {},
        create: {
            id: DEFAULT_USER_ID,
            email: DEFAULT_USER_EMAIL,
            name: 'Development User',
        },
        select: {
            id: true,
            email: true,
        },
    });
}

module.exports = {
    DEFAULT_USER_ID,
    ensureDefaultUser,
};