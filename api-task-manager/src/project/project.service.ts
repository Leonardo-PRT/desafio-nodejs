import {
    BadRequestException,
    ForbiddenException,
    Injectable,
    InternalServerErrorException,
    NotFoundException,
} from "@nestjs/common";
import {CreateProjectDto} from "./create-project.dto";
import {PrismaService} from "../prisma.service";
import {AddMemberDto} from "./add-menber.dto";
import {UpdateProjectDto} from "./update-project.dto";

@Injectable()
export class ProjectService {
    constructor(private prisma: PrismaService) {}


    async create(projectDTO: CreateProjectDto) {
        const userFound = await this.prisma.user.findUnique({where: {id: projectDTO.ownerId}});

        if (!userFound){
            throw new NotFoundException("User not found");
        }

        try {
            const data = {
                name: projectDTO.name,
                description: projectDTO.description,
                ownerId: projectDTO.ownerId,
            }

            return await this.prisma.project.create({data: data});

        } catch (error) {

            throw new InternalServerErrorException(
                `Failed to create user: ${error.message}`,
            );
        }
    }

    async addMember(addMemberDTO: AddMemberDto, ownerId: number) {
        const project = await this.prisma.project.findUnique({
            where: { id: addMemberDTO.projectId },
        });

        if (!project) {
            throw new NotFoundException("Project not found");
        }

        console.log(project.ownerId != ownerId)

        if (project.ownerId != ownerId) {
            throw new ForbiddenException("Only the project owner can add members");
        }

        const user = await this.prisma.user.findUnique({ where: { id: addMemberDTO.userId } });

        if (!user) {
            throw new NotFoundException("User not found");
        }

        try {
            return await this.prisma.userProject.create({
                data: {
                    userId: addMemberDTO.userId,
                    projectId: addMemberDTO.projectId,
                },
            });
        } catch (error) {
            throw new InternalServerErrorException(`Failed to add member: ${error.message}`);
        }
    }

    async removeMember(projectId: number, memberId: number, ownerId: number) {
        const project = await this.prisma.project.findUnique({
            where: { id: Number(projectId) },
        });

        if (!project) {
            throw new NotFoundException("Project not found");
        }

        if (project.ownerId != ownerId) {
            throw new ForbiddenException("Only the project owner can remove members");
        }

        const userProject = await this.prisma.userProject.findFirst({
            where: { projectId: Number(projectId), userId: Number(memberId) },
        });

        if (!userProject) {
            throw new NotFoundException("Member not found in project");
        }

        try {
            await this.prisma.userProject.delete({
                where: { id: userProject.id },
            });
            return { message: 'Member removed successfully' };
        } catch (error) {
            throw new InternalServerErrorException(`Failed to remove member: ${error.message}`);
        }
    }

    async update(projectId: number, updateProjectDto: UpdateProjectDto) {
        const project = await this.prisma.project.findUnique({
            where: { id: Number(projectId) },
        });

        if (!project) {
            throw new NotFoundException("Project not found");
        }

        console.log(updateProjectDto)

        try {
            return await this.prisma.project.update({
                where: { id: Number(projectId) },
                data: {
                    name: updateProjectDto.name,
                    description: updateProjectDto.description,
                },
            });
        } catch (error) {
            throw new InternalServerErrorException(`Failed to update project: ${error.message}`);
        }
    }

    async findAll(page: number, size: number) {
        const skip = page * size;

        try {
            const [projects, total] = await Promise.all([
                this.prisma.project.findMany({
                    skip: skip,
                    take: Number(size),
                }),
                this.prisma.project.count(),
            ]);

            return {
                data: projects,
                total,
                page,
                size,
            };
        } catch (error) {
            throw new InternalServerErrorException(`Failed to retrieve projects: ${error.message}`);
        }
    }
}