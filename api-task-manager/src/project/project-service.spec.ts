import { Test, TestingModule } from '@nestjs/testing';
import { ProjectService } from './project.service';
import { PrismaService } from '../prisma.service';
import { CreateProjectDto } from './create-project.dto';
import { AddMemberDto } from './add-menber.dto';
import { UpdateProjectDto } from './update-project.dto';
import { NotFoundException, InternalServerErrorException, ForbiddenException } from '@nestjs/common';

describe('ProjectService', () => {
    let service: ProjectService;
    let prisma: PrismaService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ProjectService,
                {
                    provide: PrismaService,
                    useValue: {
                        user: {
                            findUnique: jest.fn(),
                        },
                        project: {
                            create: jest.fn(),
                            findUnique: jest.fn(),
                            update: jest.fn(),
                            findMany: jest.fn(),
                            count: jest.fn(),
                            delete: jest.fn(),
                        },
                        userProject: {
                            create: jest.fn(),
                            findFirst: jest.fn(),
                            delete: jest.fn(),
                        },
                    },
                },
            ],
        }).compile();

        service = module.get<ProjectService>(ProjectService);
        prisma = module.get<PrismaService>(PrismaService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('create', () => {
        it('should create a project', async () => {
            const createProjectDto: CreateProjectDto = {
                ownerId: 1,
                name: 'Test Project',
                description: 'Test Description',
            };

            const userFound = { id: 1, name: 'Test User' };
            const createdProject = { id: 1, ...createProjectDto };

            (prisma.user.findUnique as jest.Mock).mockResolvedValue(userFound);
            (prisma.project.create as jest.Mock).mockResolvedValue(createdProject);

            const result = await service.create(createProjectDto);

            expect(result).toEqual(createdProject);
            expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { id: 1 } });
            expect(prisma.project.create).toHaveBeenCalledWith({ data: createProjectDto });
        });

        it('should throw NotFoundException if user is not found', async () => {
            const createProjectDto: CreateProjectDto = {
                ownerId: 1,
                name: 'Test Project',
                description: 'Test Description',
            };

            (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

            await expect(service.create(createProjectDto)).rejects.toThrow(NotFoundException);
        });

        it('should throw InternalServerErrorException if creation fails', async () => {
            const createProjectDto: CreateProjectDto = {
                ownerId: 1,
                name: 'Test Project',
                description: 'Test Description',
            };

            const userFound = { id: 1, name: 'Test User' };

            (prisma.user.findUnique as jest.Mock).mockResolvedValue(userFound);
            (prisma.project.create as jest.Mock).mockRejectedValueOnce(new Error('Create failed'));

            await expect(service.create(createProjectDto)).rejects.toThrow(InternalServerErrorException);
        });
    });

    describe('addMember', () => {
        it('should add a member to a project', async () => {
            const addMemberDto: AddMemberDto = {
                userId: 2,
                projectId: 1,
            };
            const project = { id: 1, ownerId: 1, name: 'Test Project' };
            const user = { id: 2, name: 'Test User' };
            const userProject = { id: 1, userId: 2, projectId: 1 };

            (prisma.project.findUnique as jest.Mock).mockResolvedValue(project);
            (prisma.user.findUnique as jest.Mock).mockResolvedValue(user);
            (prisma.userProject.create as jest.Mock).mockResolvedValue(userProject);

            const result = await service.addMember(addMemberDto, 1);

            expect(result).toEqual(userProject);
            expect(prisma.project.findUnique).toHaveBeenCalledWith({ where: { id: addMemberDto.projectId } });
            expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { id: addMemberDto.userId } });
            expect(prisma.userProject.create).toHaveBeenCalledWith({
                data: {
                    userId: addMemberDto.userId,
                    projectId: addMemberDto.projectId,
                },
            });
        });

        it('should throw NotFoundException if project is not found', async () => {
            const addMemberDto: AddMemberDto = {
                userId: 2,
                projectId: 1,
            };

            (prisma.project.findUnique as jest.Mock).mockResolvedValue(null);

            await expect(service.addMember(addMemberDto, 1)).rejects.toThrow(NotFoundException);
        });

        it('should throw ForbiddenException if owner is not correct', async () => {
            const addMemberDto: AddMemberDto = {
                userId: 2,
                projectId: 1,
            };
            const project = { id: 1, ownerId: 2, name: 'Test Project' };

            (prisma.project.findUnique as jest.Mock).mockResolvedValue(project);

            await expect(service.addMember(addMemberDto, 1)).rejects.toThrow(ForbiddenException);
        });

        it('should throw NotFoundException if user is not found', async () => {
            const addMemberDto: AddMemberDto = {
                userId: 2,
                projectId: 1,
            };
            const project = { id: 1, ownerId: 1, name: 'Test Project' };

            (prisma.project.findUnique as jest.Mock).mockResolvedValue(project);
            (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

            await expect(service.addMember(addMemberDto, 1)).rejects.toThrow(NotFoundException);
        });

        it('should throw InternalServerErrorException if adding member fails', async () => {
            const addMemberDto: AddMemberDto = {
                userId: 2,
                projectId: 1,
            };
            const project = { id: 1, ownerId: 1, name: 'Test Project' };
            const user = { id: 2, name: 'Test User' };

            (prisma.project.findUnique as jest.Mock).mockResolvedValue(project);
            (prisma.user.findUnique as jest.Mock).mockResolvedValue(user);
            (prisma.userProject.create as jest.Mock).mockRejectedValueOnce(new Error('Create failed'));

            await expect(service.addMember(addMemberDto, 1)).rejects.toThrow(InternalServerErrorException);
        });
    });

    describe('removeMember', () => {
        it('should remove a member from a project', async () => {
            const projectId = 1;
            const memberId = 2;
            const ownerId = 1;
            const project = { id: 1, ownerId: 1, name: 'Test Project' };
            const userProject = { id: 1, userId: 2, projectId: 1 };

            (prisma.project.findUnique as jest.Mock).mockResolvedValue(project);
            (prisma.userProject.findFirst as jest.Mock).mockResolvedValue(userProject);
            (prisma.userProject.delete as jest.Mock).mockResolvedValue(userProject);

            const result = await service.removeMember(projectId, memberId, ownerId);

            expect(result).toEqual({ message: 'Member removed successfully' });
            expect(prisma.project.findUnique).toHaveBeenCalledWith({ where: { id: projectId } });
            expect(prisma.userProject.findFirst).toHaveBeenCalledWith({
                where: { projectId: projectId, userId: memberId },
            });
            expect(prisma.userProject.delete).toHaveBeenCalledWith({ where: { id: userProject.id } });
        });

        it('should throw NotFoundException if project is not found', async () => {
            const projectId = 1;
            const memberId = 2;
            const ownerId = 1;

            (prisma.project.findUnique as jest.Mock).mockResolvedValue(null);

            await expect(service.removeMember(projectId, memberId, ownerId)).rejects.toThrow(NotFoundException);
        });

        it('should throw ForbiddenException if owner is not correct', async () => {
            const projectId = 1;
            const memberId = 2;
            const ownerId = 1;
            const project = { id: 1, ownerId: 2, name: 'Test Project' };

            (prisma.project.findUnique as jest.Mock).mockResolvedValue(project);

            await expect(service.removeMember(projectId, memberId, ownerId)).rejects.toThrow(ForbiddenException);
        });

        it('should throw NotFoundException if member is not found in project', async () => {
            const projectId = 1;
            const memberId = 2;
            const ownerId = 1;
            const project = { id: 1, ownerId: 1, name: 'Test Project' };

            (prisma.project.findUnique as jest.Mock).mockResolvedValue(project);
            (prisma.userProject.findFirst as jest.Mock).mockResolvedValue(null);

            await expect(service.removeMember(projectId, memberId, ownerId)).rejects.toThrow(NotFoundException);
        });

        it('should throw InternalServerErrorException if removal fails', async () => {
            const projectId = 1;
            const memberId = 2;
            const ownerId = 1;
            const project = { id: 1, ownerId: 1, name: 'Test Project' };
            const userProject = { id: 1, userId: 2, projectId: 1 };

            (prisma.project.findUnique as jest.Mock).mockResolvedValue(project);
            (prisma.userProject.findFirst as jest.Mock).mockResolvedValue(userProject);
            (prisma.userProject.delete as jest.Mock).mockRejectedValueOnce(new Error('Delete failed'));

            await expect(service.removeMember(projectId, memberId, ownerId)).rejects.toThrow(InternalServerErrorException);
        });
    });

    describe('update', () => {
        it('should update a project', async () => {
            const projectId = 1;
            const updateProjectDto: UpdateProjectDto = {
                name: 'Updated Project',
                description: 'Updated Description',
            };
            const project = { id: 1, name: 'Test Project', description: 'Test Description', ownerId: 1 };
            const updatedProject = { ...project, ...updateProjectDto };

            (prisma.project.findUnique as jest.Mock).mockResolvedValue(project);
            (prisma.project.update as jest.Mock).mockResolvedValue(updatedProject);

            const result = await service.update(projectId, updateProjectDto);

            expect(result).toEqual(updatedProject);
            expect(prisma.project.findUnique).toHaveBeenCalledWith({ where: { id: projectId } });
            expect(prisma.project.update).toHaveBeenCalledWith({
                where: { id: projectId },
                data: updateProjectDto,
            });
        });

        it('should throw NotFoundException if project is not found', async () => {
            const projectId = 1;
            const updateProjectDto: UpdateProjectDto = {
                name: 'Updated Project',
                description: 'Updated Description',
            };

            (prisma.project.findUnique as jest.Mock).mockResolvedValue(null);

            await expect(service.update(projectId, updateProjectDto)).rejects.toThrow(NotFoundException);
        });

        it('should throw InternalServerErrorException if update fails', async () => {
            const projectId = 1;
            const updateProjectDto: UpdateProjectDto = {
                name: 'Updated Project',
                description: 'Updated Description',
            };
            const project = { id: 1, name: 'Test Project', description: 'Test Description', ownerId: 1 };

            (prisma.project.findUnique as jest.Mock).mockResolvedValue(project);
            (prisma.project.update as jest.Mock).mockRejectedValueOnce(new Error('Update failed'));

            await expect(service.update(projectId, updateProjectDto)).rejects.toThrow(InternalServerErrorException);
        });
    });

    describe('findAll', () => {
        it('should return all projects with pagination', async () => {
            const projects = [
                { id: 1, name: 'Test Project 1', description: 'Test Description 1', ownerId: 1 },
                { id: 2, name: 'Test Project 2', description: 'Test Description 2', ownerId: 1 },
            ];
            const total = 2;

            (prisma.project.findMany as jest.Mock).mockResolvedValue(projects);
            (prisma.project.count as jest.Mock).mockResolvedValue(total);

            const result = await service.findAll(0, 10);

            expect(result).toEqual({
                data: projects,
                total,
                page: 0,
                size: 10,
            });
            expect(prisma.project.findMany).toHaveBeenCalledWith({
                skip: 0,
                take: 10,
            });
            expect(prisma.project.count).toHaveBeenCalled();
        });

        it('should throw InternalServerErrorException when retrieval fails', async () => {
            (prisma.project.findMany as jest.Mock).mockRejectedValueOnce(new Error('Find many failed'));

            await expect(service.findAll(0, 10)).rejects.toThrow(InternalServerErrorException);
        });
    });

    describe('findById', () => {
        it('should return a project by ID', async () => {
            const project = { id: 1, name: 'Test Project', description: 'Test Description', ownerId: 1 };

            (prisma.project.findUnique as jest.Mock).mockResolvedValue(project);

            const result = await service.detail(1);

            expect(result).toEqual(project);
            expect(prisma.project.findUnique).toHaveBeenCalledWith({ where: { id: 1 } });
        });

        it('should throw NotFoundException if project is not found', async () => {
            (prisma.project.findUnique as jest.Mock).mockResolvedValue(null);

            await expect(service.detail(1)).rejects.toThrow(NotFoundException);
        });

        it('should throw InternalServerErrorException if retrieval fails', async () => {
            (prisma.project.findUnique as jest.Mock).mockRejectedValueOnce(new InternalServerErrorException());

            await expect(service.detail(1)).rejects.toThrow(InternalServerErrorException);
        });
    });

    describe('remove', () => {
        it('should delete a project', async () => {
            const project = { id: 1, name: 'Test Project', description: 'Test Description', ownerId: 1 };

            (prisma.project.findUnique as jest.Mock).mockResolvedValue(project);
            (prisma.project.delete as jest.Mock).mockResolvedValue(project);

            await service.delete(1);

            expect(prisma.project.findUnique).toHaveBeenCalledWith({ where: { id: 1 } });
            expect(prisma.project.delete).toHaveBeenCalledWith({ where: { id: 1 } });
        });

        it('should throw NotFoundException if project is not found', async () => {
            (prisma.project.findUnique as jest.Mock).mockResolvedValue(null);

            await expect(service.delete(1)).rejects.toThrow(NotFoundException);
        });

        it('should throw InternalServerErrorException if deletion fails', async () => {
            const project = { id: 1, name: 'Test Project', description: 'Test Description', ownerId: 1 };

            (prisma.project.findUnique as jest.Mock).mockResolvedValue(project);
            (prisma.project.delete as jest.Mock).mockRejectedValueOnce(new InternalServerErrorException());

            await expect(service.delete(1)).rejects.toThrow(InternalServerErrorException);
        });
    });
});


