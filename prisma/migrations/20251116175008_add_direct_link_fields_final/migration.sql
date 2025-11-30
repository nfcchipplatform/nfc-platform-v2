-- AlterTable
ALTER TABLE "User" ADD COLUMN     "directLinkEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "directLinkUrl" TEXT;
