-- CreateTable
CREATE TABLE "RoomSnakeSettings" (
    "roomId" TEXT NOT NULL,
    "fieldWidth" INTEGER NOT NULL DEFAULT 20,
    "fieldHeight" INTEGER NOT NULL DEFAULT 20,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RoomSnakeSettings_pkey" PRIMARY KEY ("roomId")
);

-- AddForeignKey
ALTER TABLE "RoomSnakeSettings" ADD CONSTRAINT "RoomSnakeSettings_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE CASCADE ON UPDATE CASCADE;
