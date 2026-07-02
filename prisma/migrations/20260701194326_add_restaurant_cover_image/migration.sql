-- AlterTable
ALTER TABLE "theme_settings" ADD COLUMN     "coverImageAssetId" TEXT;

-- AddForeignKey
ALTER TABLE "theme_settings" ADD CONSTRAINT "theme_settings_coverImageAssetId_fkey" FOREIGN KEY ("coverImageAssetId") REFERENCES "media_assets"("id") ON DELETE SET NULL ON UPDATE CASCADE;
