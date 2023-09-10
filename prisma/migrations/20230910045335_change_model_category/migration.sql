-- DropForeignKey
ALTER TABLE `Books` DROP FOREIGN KEY `Books_categoryId_fkey`;

-- DropForeignKey
ALTER TABLE `Books` DROP FOREIGN KEY `Books_publisherId_fkey`;

-- AlterTable
ALTER TABLE `Books` MODIFY `publisherId` INTEGER NULL,
    MODIFY `categoryId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `Books` ADD CONSTRAINT `Books_publisherId_fkey` FOREIGN KEY (`publisherId`) REFERENCES `Publishers`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Books` ADD CONSTRAINT `Books_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `Categories`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
