import {Injectable, InternalServerErrorException, NotFoundException,} from "@nestjs/common";
import {CreateProjectDto} from "./create-project.dto";
import {PrismaService} from "../prisma.service";

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
}