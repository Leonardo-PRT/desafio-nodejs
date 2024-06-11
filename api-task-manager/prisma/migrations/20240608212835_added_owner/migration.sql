/*
  Warnings:

  - Changed the type of `status` on the `tb_task` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "TaskStaus" AS ENUM ('Pending', 'InProgress', 'Done');

-- AlterTable
ALTER TABLE "tb_project" ADD COLUMN     "ownerId" INTEGER;

-- AlterTable
ALTER TABLE "tb_task" DROP COLUMN "status",
ADD COLUMN     "status" "TaskStaus" NOT NULL;

-- AddForeignKey
ALTER TABLE "tb_project" ADD CONSTRAINT "tb_project_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "tb_user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
