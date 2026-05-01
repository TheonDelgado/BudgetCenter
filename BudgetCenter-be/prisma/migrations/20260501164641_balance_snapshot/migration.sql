-- CreateTable
CREATE TABLE `BalanceSnapshot` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `monthKey` VARCHAR(191) NOT NULL,
    `totalBalance` DECIMAL(15, 2) NOT NULL,
    `capturedAt` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL,

    INDEX `BalanceSnapshot_userId_monthKey_idx`(`userId`, `monthKey`),
    UNIQUE INDEX `BalanceSnapshot_userId_monthKey_key`(`userId`, `monthKey`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `BalanceSnapshot` ADD CONSTRAINT `BalanceSnapshot_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
