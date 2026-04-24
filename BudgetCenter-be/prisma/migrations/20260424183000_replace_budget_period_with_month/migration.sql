-- AlterTable
ALTER TABLE `Budget`
    ADD COLUMN `month` VARCHAR(191) NULL;

-- Backfill month from existing period columns for current records
UPDATE `Budget`
SET `month` = COALESCE(NULLIF(`periodStart`, ''), NULLIF(`periodEnd`, ''), 'Uncategorized');

-- Ensure month is required for future records
ALTER TABLE `Budget`
    MODIFY `month` VARCHAR(191) NOT NULL;

-- Remove deprecated period range columns
ALTER TABLE `Budget`
    DROP COLUMN `periodStart`,
    DROP COLUMN `periodEnd`;
