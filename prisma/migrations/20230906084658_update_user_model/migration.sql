-- CreateIndex
CREATE FULLTEXT INDEX `Users_firstName_lastName_idx` ON `Users`(`firstName`, `lastName`);
