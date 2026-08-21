/*
  Warnings:

  - You are about to drop the column `category` on the `gallery_items` table. All the data in the column will be lost.
  - Added the required column `categoryId` to the `gallery_items` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "gallery_items" DROP COLUMN "category",
ADD COLUMN     "categoryId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "gallery_categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "gallery_categories_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "gallery_categories_name_key" ON "gallery_categories"("name");

-- AddForeignKey
ALTER TABLE "gallery_items" ADD CONSTRAINT "gallery_items_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "gallery_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
