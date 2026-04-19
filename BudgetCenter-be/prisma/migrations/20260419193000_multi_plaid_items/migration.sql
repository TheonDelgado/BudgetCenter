-- CreateTable
CREATE TABLE `PlaidItem` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `accessToken` VARCHAR(191) NOT NULL,
    `itemId` VARCHAR(191) NULL,
    `institutionId` VARCHAR(191) NULL,
    `institutionName` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `PlaidItem_accessToken_key`(`accessToken`),
    UNIQUE INDEX `PlaidItem_itemId_key`(`itemId`),
    INDEX `PlaidItem_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- MigrateData
INSERT INTO `PlaidItem` (`userId`, `accessToken`, `createdAt`, `updatedAt`)
SELECT `id`, `accessToken`, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)
FROM `User`
WHERE `accessToken` IS NOT NULL;

-- DropIndex
DROP INDEX `User_accessToken_key` ON `User`;

-- AlterTable
ALTER TABLE `User`
    DROP COLUMN `accessToken`;

-- AddForeignKey
ALTER TABLE `PlaidItem`
    ADD CONSTRAINT `PlaidItem_userId_fkey`
    FOREIGN KEY (`userId`) REFERENCES `User`(`id`)
    ON DELETE CASCADE ON UPDATE CASCADE;
