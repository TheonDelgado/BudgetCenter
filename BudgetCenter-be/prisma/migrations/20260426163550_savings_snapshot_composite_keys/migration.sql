-- CreateTable
CREATE TABLE `SavingsSnapshot` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `monthKey` VARCHAR(191) NOT NULL,
    `accountId` VARCHAR(191) NOT NULL,
    `balance` DECIMAL(15, 2) NOT NULL,
    `capturedAt` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL,

    INDEX `SavingsSnapshot_userId_monthKey_idx`(`userId`, `monthKey`),
    UNIQUE INDEX `SavingsSnapshot_userId_monthKey_accountId_key`(`userId`, `monthKey`, `accountId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
