-- AlterTable
ALTER TABLE "site_settings" ADD COLUMN     "mapEmbedUrl" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "socialLinks" JSONB NOT NULL DEFAULT '[]';
