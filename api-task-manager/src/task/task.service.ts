import {
    BadRequestException,
    ForbiddenException,
    Injectable,
    InternalServerErrorException, Logger,
    NotFoundException
} from "@nestjs/common";
import {PrismaService} from "../prisma.service";
import {CreateTaskDto} from "./create-task.dto";
import {UpdateTaskDto} from "./update-task.dto";
import {ProjectService} from "../project/project.service";

@Injectable()
export class TaskService {
    private readonly logger = new Logger(ProjectService.name);

    constructor(private prisma: PrismaService) {
    }

    async create(createTaskDto: CreateTaskDto, userId: number) {
        const project = await this.prisma.project.findUnique({
            where: {id: createTaskDto.projectId},
            include: {UserProject: {where: {userId: Number(userId)}}},
        });

        if (!project) {
            this.logger.error("Project not found");
            throw new NotFoundException("Project not found");
        }

        if (project.UserProject.length === 0) {
            this.logger.error("Only project members can create tasks");
            throw new ForbiddenException("Only project members can create tasks");
        }

        if (createTaskDto.status === 'Done') {
            this.logger.error("Completed tasks cannot be edited");
            throw new BadRequestException("Completed tasks cannot be edited");
        }

        if (!createTaskDto.tags || createTaskDto.tags.length === 0) {
            this.logger.error("Tasks must have tags");
            throw new BadRequestException("Tasks must have tags");
        }

        const tags = await Promise.all(createTaskDto.tags.map(async (tagId) => {
            let tag = await this.prisma.tag.findUnique({where: {id: tagId}});
            if (!tag) {
                this.logger.error(`No tag found with this id: ${tagId}`);
                throw new NotFoundException(`No tag found with this id: ${tagId}`);
            }
            return {id: tag.id};
        }));

        try {
            const task = await this.prisma.task.create({
                data: {
                    title: createTaskDto.title,
                    description: createTaskDto.description,
                    status: createTaskDto.status,
                    projectId: createTaskDto.projectId,
                    userId: Number(userId),
                }
            });

            await Promise.all(tags.map(tag => {
                return this.prisma.taskTag.create({
                    data: {
                        taskId: task.id,
                        tagId: tag.id,
                    },
                });
            }));

            return task;
        } catch (error) {
            this.logger.error(`Failed to create task: ${error.message}`);
            throw new InternalServerErrorException(`Failed to create task: ${error.message}`);
        }
    }

    async detail(taskId: number) {
        const task = await this.prisma.task.findUnique({
            where: {id: Number(taskId),},
            include: {
                TaskTag: {
                    include: {
                        tag: {
                            select: {
                                id: true,
                                title: true,
                            }
                        }
                    }
                }
            }
        });

        if (task){
            if (task.TaskTag) {
                task.TaskTag.forEach(taskTag => {
                    delete taskTag.taskId;
                    delete taskTag.tagId;
                });
            }
        }


        if (!task) {
            this.logger.error("Task not found");
            throw new NotFoundException("Task not found");
        }

        return task;
    }

    async update(taskId: number, updateTaskDto: UpdateTaskDto, userId: number) {
        const task = await this.prisma.task.findUnique({
            where: {id: Number(taskId)},
        });

        if (!task) {
            this.logger.error("Task not found");
            throw new NotFoundException("Task not found");
        }

        const isMember = await this.prisma.userProject.findFirst({
            where: {
                projectId: task.projectId,
                userId: Number(userId),
            },
        });

        if (!isMember) {
            this.logger.error("Only project members can update tasks");
            throw new ForbiddenException("Only project members can update tasks");
        }

        if (task.status === 'Done') {
            this.logger.error("Completed tasks cannot be edited");
            throw new BadRequestException("Completed tasks cannot be edited");
        }

        if (updateTaskDto.tags && updateTaskDto.tags.length === 0) {
            this.logger.error("Tasks must have tags");
            throw new BadRequestException("Tasks must have tags");
        }

        const tags = updateTaskDto.tags ? await Promise.all(updateTaskDto.tags.map(async (tagId) => {
            let tag = await this.prisma.tag.findUnique({where: {id: tagId}});

            if (!tag) {
                this.logger.error(`No tag found with this id: ${tagId}`);
                throw new NotFoundException(`No tag found with this id: ${tagId}`);

            }
            return tag;
        })) : undefined;

        try {
            const updatedTask = await this.prisma.task.update({
                where: {id: Number(taskId)},
                data: {
                    title: updateTaskDto.title,
                    description: updateTaskDto.description,
                    status: updateTaskDto.status,
                },
            });

            const currentTags = await this.prisma.taskTag.findMany({where: {taskId: Number(taskId)}});

            if (tags) {
                const currentTagIds = currentTags.map(tag => tag.tagId);
                const newTags = tags.filter(tag => !currentTagIds.includes(tag.id));
                const tagsToRemove = currentTagIds.filter(tag => !updateTaskDto.tags.includes(tag));

                await Promise.all(newTags.map(tag => {
                    return this.prisma.taskTag.create({
                        data: {
                            taskId: updatedTask.id,
                            tagId: tag.id,
                        },
                    });
                }));

                await Promise.all(tagsToRemove.map(async (tagId) => {
                    const tag = await this.prisma.tag.findUnique({where: {id: tagId}});
                    return this.prisma.taskTag.delete({
                        where: {
                            taskId_tagId: {
                                taskId: updatedTask.id,
                                tagId: tag.id,
                            },
                        },
                    });
                }));
            }

            return updatedTask;
        } catch (error) {
            this.logger.error(`Failed to update task: ${error.message}`);
            throw new InternalServerErrorException(`Failed to update task: ${error.message}`);
        }
    }

    async delete(taskId: number, userId: number) {
        const task = await this.prisma.task.findUnique({
            where: { id: Number(taskId) },
            include: { project: true },
        });

        if (!task) {
            this.logger.error("Task not found");
            throw new NotFoundException("Task not found");
        }

        const isMember = await this.prisma.userProject.findFirst({
            where: {
                projectId: task.projectId,
                userId: Number(userId),
            },
        });

        if (!isMember) {
            this.logger.error("Only project members can delete tasks");
            throw new ForbiddenException("Only project members can delete tasks");
        }

        if (task.status === 'Done') {
            this.logger.error("Completed tasks cannot be deleted");
            throw new BadRequestException("Completed tasks cannot be deleted");
        }

        try {
            await this.prisma.taskTag.deleteMany({
                where: { taskId: Number(taskId) },
            });

            await this.prisma.task.delete({
                where: { id: Number(taskId) },
            });
            return { message: 'Task deleted successfully' };
        } catch (error) {
            this.logger.error(`Failed to delete task: ${error.message}`);
            throw new InternalServerErrorException(`Failed to delete task: ${error.message}`);
        }
    }

    async findAll(page: number, size: number) {
        const skip = page * size;

        try {
            const [tasks, total] = await Promise.all([
                this.prisma.task.findMany({
                    skip: skip,
                    take: Number(size),
                    include: {
                        TaskTag: {
                            include: {
                                tag: {
                                    select: {
                                        id: true,
                                        title: true,
                                    }
                                }
                            }
                        }
                    }
                }),
                this.prisma.task.count(),
            ]);

            tasks.forEach(task => {
                if (task.TaskTag) {
                    task.TaskTag.forEach(taskTag => {
                        delete taskTag.taskId;
                        delete taskTag.tagId;
                    });
                }
            });

            return {
                data: tasks,
                total,
                page,
                size,
            };
        } catch (error) {
            this.logger.error(`Failed to retrieve tasks: ${error.message}`);
            throw new InternalServerErrorException(`Failed to retrieve tasks: ${error.message}`);
        }
    }
}