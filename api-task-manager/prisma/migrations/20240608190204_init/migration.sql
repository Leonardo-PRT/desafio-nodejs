-- CreateTable
CREATE TABLE "tb_user" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,

    CONSTRAINT "tb_user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tb_project" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "tb_project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rl_user_project" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER,
    "projectId" INTEGER,

    CONSTRAINT "rl_user_project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tb_task" (
    "id" SERIAL NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL,
    "projectId" INTEGER NOT NULL,
    "userId" INTEGER,

    CONSTRAINT "tb_task_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tb_tag" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "taskId" INTEGER NOT NULL,

    CONSTRAINT "tb_tag_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tb_user_email_key" ON "tb_user"("email");

-- AddForeignKey
ALTER TABLE "rl_user_project" ADD CONSTRAINT "rl_user_project_userId_fkey" FOREIGN KEY ("userId") REFERENCES "tb_user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rl_user_project" ADD CONSTRAINT "rl_user_project_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "tb_project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tb_task" ADD CONSTRAINT "tb_task_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "tb_project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tb_task" ADD CONSTRAINT "tb_task_userId_fkey" FOREIGN KEY ("userId") REFERENCES "tb_user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tb_tag" ADD CONSTRAINT "tb_tag_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "tb_task"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
