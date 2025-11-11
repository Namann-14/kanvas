/*
  Warnings:

  - A unique constraint covering the columns `[workspaceId]` on the table `Board` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Board_workspaceId_key" ON "Board"("workspaceId");
