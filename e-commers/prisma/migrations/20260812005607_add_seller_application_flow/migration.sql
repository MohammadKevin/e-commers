-- AlterTable
ALTER TABLE `user` MODIFY `globalRole` ENUM('SUPER_ADMIN', 'OPERATIONS_CS', 'FINANCE_ADMIN', 'MARKETING_ADMIN', 'USER', 'SELLER') NOT NULL DEFAULT 'USER';

-- CreateTable
CREATE TABLE `SellerApplication` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `storeName` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `status` ENUM('PENDING', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
    `reviewedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `SellerApplication_userId_key`(`userId`),
    UNIQUE INDEX `SellerApplication_storeName_key`(`storeName`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `SellerApplication` ADD CONSTRAINT `SellerApplication_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
