-- CreateTable
CREATE TABLE "OAuthAccount" (
    "id" TEXT NOT NULL,
    "provider" "OAuthProvider" NOT NULL,
    "oauthId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OAuthAccount_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "OAuthAccount_provider_oauthId_key" ON "OAuthAccount"("provider", "oauthId");

-- CreateIndex
CREATE INDEX "OAuthAccount_userId_idx" ON "OAuthAccount"("userId");

-- AddForeignKey
ALTER TABLE "OAuthAccount" ADD CONSTRAINT "OAuthAccount_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Move existing links out of User before the columns go away.
INSERT INTO "OAuthAccount" ("id", "provider", "oauthId", "userId", "createdAt")
SELECT gen_random_uuid()::text, "oauthProvider", "oauthId", "id", "createdAt"
FROM "User"
WHERE "oauthProvider" IS NOT NULL AND "oauthId" IS NOT NULL;

-- DropIndex
DROP INDEX "User_oauthProvider_oauthId_key";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "oauthProvider",
DROP COLUMN "oauthId";
