import {Test, TestingModule} from '@nestjs/testing';
import {TaskController} from './task.controller';
import {TaskService} from './task.service';
import {CreateTaskDto, TaskStatus} from './create-task.dto';
import {UpdateTaskDto} from './update-task.dto';
import {BadRequestException, NotFoundException} from '@nestjs/common';

describe('TaskController', () => {
    let controller: TaskController;
    let service: TaskService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [TaskController],
            providers: [
                {
                    provide: TaskService,
                    useValue: {
                        createTask: jest.fn(),
                        getTaskById: jest.fn(),
                        updateTask: jest.fn(),
                        deleteTask: jest.fn(),
                        findAll: jest.fn(),
                    },
                },
            ],
        }).compile();

        controller = module.get<TaskController>(TaskController);
        service = module.get<TaskService>(TaskService);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('createTask', () => {
        it('should create a task', async () => {
            const createTaskDto: CreateTaskDto = { title: 'Test Task', description: 'Test Description', status: TaskStatus.Pending, projectId: 1, tags: [1] };
            const userId = 1;
            const createdTask = { id: 1, ...createTaskDto };

            (service.create as jest.Mock).mockResolvedValue(createdTask);

            const result = await controller.create(createTaskDto, userId);

            expect(result).toEqual(createdTask);
            expect(service.create).toHaveBeenCalledWith(createTaskDto, userId);
        });

        it('should throw BadRequestException for invalid input', async () => {
            const createTaskDto: CreateTaskDto = { title: '', description: '', status: null, projectId: null, tags: null };
            const userId = 1;

            (service.create as jest.Mock).mockRejectedValue(new BadRequestException());

            await expect(controller.create(createTaskDto, userId)).rejects.toThrow(BadRequestException);
        });
    });

    describe('getTaskById', () => {
        it('should return a task by ID', async () => {
            const taskId = 1;
            const task = { id: taskId, title: 'Test Task', description: 'Test Description' };

            (service.detail as jest.Mock).mockResolvedValue(task);

            const result = await controller.detail(taskId);

            expect(result).toEqual(task);
            expect(service.detail).toHaveBeenCalledWith(taskId);
        });

        it('should throw NotFoundException when task not found', async () => {
            const taskId = 999;

            (service.detail as jest.Mock).mockRejectedValue(new NotFoundException());

            await expect(controller.detail(taskId)).rejects.toThrow(NotFoundException);
        });
    });

    describe('updateTask', () => {
        it('should update a task', async () => {
            const taskId = 1;
            const updateTaskDto: UpdateTaskDto = { title: 'Test Task', description: 'Test Description', status: TaskStatus.Pending, tags: [1] };
            const userId = 1;
            const updatedTask = { id: taskId, ...updateTaskDto };

            (service.update as jest.Mock).mockResolvedValue(updatedTask);

            const result = await controller.update(taskId, updateTaskDto, userId);

            expect(result).toEqual(updatedTask);
            expect(service.update).toHaveBeenCalledWith(taskId, updateTaskDto, userId);
        });

        it('should throw BadRequestException for invalid input', async () => {
            const taskId = 1;
            const updateTaskDto: UpdateTaskDto = { title: '', description: '', status: null, tags: null };
            const userId = 1;

            (service.update as jest.Mock).mockRejectedValue(new BadRequestException());

            await expect(controller.update(taskId, updateTaskDto, userId)).rejects.toThrow(BadRequestException);
        });

        it('should throw NotFoundException when task not found', async () => {
            const taskId = 999;
            const updateTaskDto: UpdateTaskDto = { title: 'Test Task', description: 'Test Description', status: TaskStatus.Pending, tags: [1] };
            const userId = 1;

            (service.update as jest.Mock).mockRejectedValue(new NotFoundException());

            await expect(controller.update(taskId, updateTaskDto, userId)).rejects.toThrow(NotFoundException);
        });
    });

    describe('deleteTask', () => {
        it('should delete a task', async () => {
            const taskId = 1;
            const userId = 1;

            (service.delete as jest.Mock).mockResolvedValue({ message: 'Task deleted successfully' });

            const result = await controller.delete(taskId, userId);

            expect(result).toEqual({ message: 'Task deleted successfully' });
            expect(service.delete).toHaveBeenCalledWith(taskId, userId);
        });

        it('should throw NotFoundException when task not found', async () => {
            const taskId = 999;
            const userId = 1;

            (service.delete as jest.Mock).mockRejectedValue(new NotFoundException());

            await expect(controller.delete(taskId, userId)).rejects.toThrow(NotFoundException);
        });
    });

    describe('findAll', () => {
        it('should return all tasks with pagination', async () => {
            const page = 0;
            const size = 10;
            const tasks = [
                { id: 1, title: 'Test Task 1', description: 'Test Description 1' },
                { id: 2, title: 'Test Task 2', description: 'Test Description 2' },
            ];
            const paginatedResponse = { data: tasks, total: 2, page, size };

            (service.findAll as jest.Mock).mockResolvedValue(paginatedResponse);

            const result = await controller.findAll(page, size);

            expect(result).toEqual(paginatedResponse);
            expect(service.findAll).toHaveBeenCalledWith(page, size);
        });

        it('should throw BadRequestException for invalid pagination parameters', async () => {
            const page = -1;
            const size = 10;

            await expect(controller.findAll(page, size)).rejects.toThrow(BadRequestException);
        });
    });
});
