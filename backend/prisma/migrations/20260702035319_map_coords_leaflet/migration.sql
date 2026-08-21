/*
  Warnings:

  - You are about to drop the column `mapEmbedUrl` on the `site_settings` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "site_settings" DROP COLUMN "mapEmbedUrl",
ADD COLUMN     "mapGoogleUrl" TEXT,
ADD COLUMN     "mapLat" DOUBLE PRECISION,
ADD COLUMN     "mapLng" DOUBLE PRECISION;
