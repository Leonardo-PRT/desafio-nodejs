import { Test, TestingModule } from '@nestjs/testing';
import { TaskService } from './task.service';
import { PrismaService } from '../prisma.service';
import {CreateTaskDto, TaskStatus} from "./create-task.dto";
import {BadRequestException, ForbiddenException, InternalServerErrorException, NotFoundException} from "@nestjs/common";
import {UpdateTaskDto} from "./update-task.dto";

describe('TaskService', () => {
    let service: TaskService;
    let prisma: PrismaService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                TaskService,
                {
                    provide: PrismaService,
                    useValue: {
                        project: {
                            findUnique: jest.fn(),
                        },
                        tag: {
                            findUnique: jest.fn(),
                        },
                        task: {
                            create: jest.fn(),
                            findUnique: jest.fn(),
                            update: jest.fn(),
                            delete: jest.fn(),
                            findMany: jest.fn(),
                            count: jest.fn(),
                        },
                        taskTag: {
                            create: jest.fn(),
                            deleteMany: jest.fn(),
                            findMany: jest.fn(),
                            delete: jest.fn(),
                            findUnique: jest.fn(),
                        },
                        userProject: {
                            findFirst: jest.fn(),
                        },
                    },
                },
            ],
        }).compile();

        service = module.get<TaskService>(TaskService);
        prisma = module.get<PrismaService>(PrismaService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('createTask', () => {
        it('should create a task', async () => {
            const createTaskDto: CreateTaskDto = {
                title: 'Test Task',
                description: 'Task Description',
                status: TaskStatus.Pending,
                projectId: 1,
                tags: [1, 2],
            };
            const userId = 1;

            const project = {
                id: 1,
                UserProject: [{ userId: 1 }],
            };

            const tag1 = { id: 1 };
            const tag2 = { id: 2 };
            const createdTask = {
                id: 1,
                title: createTaskDto.title,
                description: createTaskDto.description,
                status: createTaskDto.status,
                projectId: createTaskDto.projectId,
                userId: userId,
            };

            (prisma.project.findUnique as jest.Mock).mockResolvedValue(project);
            (prisma.tag.findUnique as jest.Mock).mockResolvedValueOnce(tag1).mockResolvedValueOnce(tag2);
            (prisma.task.create as jest.Mock).mockResolvedValue(createdTask);

            const result = await service.create(createTaskDto, userId);

            expect(result).toEqual(createdTask);
            expect(prisma.project.findUnique).toHaveBeenCalledWith({
                where: { id: createTaskDto.projectId },
                include: { UserProject: { where: { userId: Number(userId) } } },
            });
            expect(prisma.task.create).toHaveBeenCalledWith({
                data: {
                    title: createTaskDto.title,
                    description: createTaskDto.description,
                    status: createTaskDto.status,
                    projectId: createTaskDto.projectId,
                    userId: Number(userId),
                },
            });
            expect(prisma.taskTag.create).toHaveBeenCalledTimes(2);
            expect(prisma.taskTag.create).toHaveBeenCalledWith({
                data: {
                    taskId: createdTask.id,
                    tagId: tag1.id,
                },
            });
            expect(prisma.taskTag.create).toHaveBeenCalledWith({
                data: {
                    taskId: createdTask.id,
                    tagId: tag2.id,
                },
            });
        });

        it('should throw NotFoundException when project is not found', async () => {
            const createTaskDto: CreateTaskDto = {
                title: 'Test Task',
                description: 'Task Description',
                status: TaskStatus.Pending,
                projectId: 1,
                tags: [1, 2],
            };
            const userId = 1;

            (prisma.project.findUnique as jest.Mock).mockResolvedValue(null);

            await expect(service.create(createTaskDto, userId)).rejects.toThrow(NotFoundException);
        });

        it('should throw ForbiddenException when user is not a project member', async () => {
            const createTaskDto: CreateTaskDto = {
                title: 'Test Task',
                description: 'Task Description',
                status: TaskStatus.Pending,
                projectId: 1,
                tags: [1, 2],
            };
            const userId = 1;

            const project = {
                id: 1,
                UserProject: [],
            };

            (prisma.project.findUnique as jest.Mock).mockResolvedValue(project);

            await expect(service.create(createTaskDto, userId)).rejects.toThrow(ForbiddenException);
        });

        it('should throw NotFoundException when a tag is not found', async () => {
            const createTaskDto: CreateTaskDto = {
                title: 'Test Task',
                description: 'Task Description',
                status: TaskStatus.Pending,
                projectId: 1,
                tags: [1, 2],
            };
            const userId = 1;

            const project = {
                id: 1,
                UserProject: [{ userId: 1 }],
            };

            (prisma.project.findUnique as jest.Mock).mockResolvedValue(project);
            (prisma.tag.findUnique as jest.Mock).mockResolvedValueOnce(null);

            await expect(service.create(createTaskDto, userId)).rejects.toThrow(NotFoundException);
        });
    });

    describe('getTaskById', () => {
        it('should return a task by id', async () => {
            const task = {
                id: 1,
                title: 'Test Task',
                description: 'Task Description',
                status: TaskStatus.Pending,
                projectId: 1,
                TaskTag: [{ tag: { id: 1, title: 'Tag 1' } }],
            };

            (prisma.task.findUnique as jest.Mock).mockResolvedValue(task);

            const result = await service.detail(1);

            expect(result).toEqual(task);
            expect(prisma.task.findUnique).toHaveBeenCalledWith({
                where: { id: 1 },
                include: { TaskTag: { include: { tag: { select: { id: true, title: true } } } } },
            });
        });

        it('should throw NotFoundException if task is not found', async () => {
            const taskId = 1;

            (prisma.task.findUnique as jest.Mock).mockResolvedValue(null);

            await expect(service.detail(taskId)).rejects.toThrow(NotFoundException);
        });

    });

    describe('updateTask', () => {
        it('should update a task', async () => {
            const taskId = 1;
            const updateTaskDto: UpdateTaskDto = {
                title: 'Updated Task',
                description: 'Updated Description',
                status: TaskStatus.InProgress,
                tags: [1, 2],
            };

            const existingTask = {
                id: taskId,
                title: 'Test Task',
                description: 'Task Description',
                status: TaskStatus.Pending,
                projectId: 1,
                userId: 1,
            };

            const updatedTask = {
                ...existingTask,
                ...updateTaskDto,
            };

            (prisma.task.findUnique as jest.Mock).mockResolvedValue(existingTask);
            (prisma.task.update as jest.Mock).mockResolvedValue(updatedTask);
            (prisma.userProject.findFirst as jest.Mock).mockResolvedValue({userId: updatedTask.userId, projectId: updatedTask.projectId});
            (prisma.tag.findUnique as jest.Mock).mockResolvedValue({id: taskId, title: 'Test Task', tagTask: [1, 1]});
            (prisma.taskTag.findUnique as jest.Mock).mockResolvedValue([{taskId: 1, tagId: 1}]);
            (prisma.taskTag.findMany as jest.Mock).mockResolvedValue([{taskId: 1, tagId: 1}, {taskId: 2, tagId: 2}]);

            const result = await service.update(taskId, updateTaskDto, 1);

            expect(result).toEqual(updatedTask);
            expect(prisma.task.findUnique).toHaveBeenCalledWith({ where: { id: taskId } });
            expect(prisma.task.update).toHaveBeenCalledWith({
                where: { id: taskId },
                data: {
                    title: updateTaskDto.title,
                    description: updateTaskDto.description,
                    status: updateTaskDto.status,
                },
            });
        });

        it('should throw NotFoundException if task is not found', async () => {
            const taskId = 1;
            const updateTaskDto: UpdateTaskDto = {
                title: 'Updated Task',
                description: 'Updated Description',
                status: TaskStatus.InProgress,
                tags: [1, 2],
            };

            (prisma.task.findUnique as jest.Mock).mockResolvedValue(null);

            await expect(service.update(taskId, updateTaskDto, 1)).rejects.toThrow(NotFoundException);
        });
    });


    describe('deleteTask', () => {
        it('should delete a task', async () => {
            const userId = 1;
            const task = {
                id: 1,
                title: 'Test Task',
                description: 'Task Description',
                status: TaskStatus.Pending,
                projectId: 1,
            };

            (prisma.task.findUnique as jest.Mock).mockResolvedValue(task);
            (prisma.userProject.findFirst as jest.Mock).mockResolvedValue({ userId });
            (prisma.task.delete as jest.Mock).mockResolvedValue(task);

            const result = await service.delete(1, userId);

            expect(result).toEqual({ message: 'Task deleted successfully' });
            expect(prisma.task.findUnique).toHaveBeenCalled();
            expect(prisma.task.delete).toHaveBeenCalledWith({ where: { id: 1 } });
        });

        it('should throw NotFoundException if task not found', async () => {
            (prisma.task.findUnique as jest.Mock).mockResolvedValue(null);

            await expect(service.delete(1, 1)).rejects.toThrow(NotFoundException);
        });

    });

    describe('findAll', () => {
        it('should return all tasks with pagination', async () => {
            const tasks = [
                { id: 1, title: 'Test Task 1', description: 'Description 1', status: TaskStatus.Pending, projectId: 1 },
                { id: 2, title: 'Test Task 2', description: 'Description 2', status: TaskStatus.InProgress, projectId: 1 },
            ];
            const total = 2;

            (prisma.task.findMany as jest.Mock).mockResolvedValue(tasks);
            (prisma.task.count as jest.Mock).mockResolvedValue(total);

            const result = await service.findAll(0, 10);

            expect(result).toEqual({ data: tasks, total, page: 0, size: 10 });
            expect(prisma.task.findMany).toHaveBeenCalledWith({
                skip: 0,
                take: 10,
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
            expect(prisma.task.count).toHaveBeenCalled();
        });

        it('should throw InternalServerErrorException when retrieval fails', async () => {
            (prisma.task.findMany as jest.Mock).mockRejectedValueOnce(new Error('FindMany failed'));

            await expect(service.findAll(0, 10)).rejects.toThrow(InternalServerErrorException);
        });
    });
});
