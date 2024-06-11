/*
  Warnings:

  - You are about to drop the column `taskId` on the `tb_tag` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "tb_tag" DROP CONSTRAINT "tb_tag_taskId_fkey";

-- AlterTable
ALTER TABLE "tb_tag" DROP COLUMN "taskId";

-- CreateTable
CREATE TABLE "tb_task_tag" (
    "taskId" INTEGER NOT NULL,
    "tagId" INTEGER NOT NULL,

    CONSTRAINT "tb_task_tag_pkey" PRIMARY KEY ("taskId","tagId")
);

-- AddForeignKey
ALTER TABLE "tb_task_tag" ADD CONSTRAINT "tb_task_tag_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "tb_task"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tb_task_tag" ADD CONSTRAINT "tb_task_tag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "tb_tag"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
