/*
  Warnings:

  - A unique constraint covering the columns `[oauthProvider,oauthId]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "OAuthProvider" AS ENUM ('google');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "oauthId" TEXT,
ADD COLUMN     "oauthProvider" "OAuthProvider",
ALTER COLUMN "password" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "User_oauthProvider_oauthId_key" ON "User"("oauthProvider", "oauthId");
