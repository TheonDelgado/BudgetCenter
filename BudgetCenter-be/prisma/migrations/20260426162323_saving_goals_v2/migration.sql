/*
  Warnings:

  - You are about to drop the column `month` on the `savingsgoal` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `savingsgoal` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId,monthKey]` on the table `SavingsGoal` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `monthKey` to the `SavingsGoal` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `savingsgoal` DROP COLUMN `month`,
    DROP COLUMN `name`,
    ADD COLUMN `monthKey` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `SavingsGoal_userId_monthKey_key` ON `SavingsGoal`(`userId`, `monthKey`);
