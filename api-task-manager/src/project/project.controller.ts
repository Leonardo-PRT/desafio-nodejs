import {
    ApiInternalServerErrorResponse,
    ApiNotFoundResponse,
    ApiOperation,
    ApiParam,
    ApiQuery,
    ApiResponse,
    ApiTags
} from "@nestjs/swagger";
import {
    BadRequestException,
    Body,
    Controller,
    Delete,
    Get, HttpStatus,
    Param,
    Patch,
    Post,
    Query,
    UsePipes,
    ValidationPipe
} from "@nestjs/common";
import { CreateProjectDto } from "./create-project.dto";
import { ProjectService } from "./project.service";
import { UpdateProjectDto } from "./update-project.dto";
import {AddMemberDto} from "./add-menber.dto";

@ApiTags('Project')
@Controller("project")
export class ProjectController {
    constructor(private readonly projectService: ProjectService) {}

    @Post()
    @ApiOperation({ summary: 'Create a new project' })
    @ApiResponse({ status: 201, description: 'Project created successfully.' })
    @ApiResponse({ status: 400, description: 'Bad Request.' })
    @UsePipes(new ValidationPipe({ whitelist: true }))
    async create(@Body() projectDTO: CreateProjectDto) {
        return await this.projectService.create(projectDTO);
    }

    @Post('/add-member/:ownerId')
    @ApiOperation({ summary: 'Add a member to a project' })
    @ApiParam({ name: 'ownerId', description: 'The ID of the project owner' })
    @ApiResponse({ status: 200, description: 'Member added successfully.' })
    @ApiResponse({ status: 400, description: 'Bad Request.' })
    @UsePipes(new ValidationPipe({ whitelist: true }))
    async addMember(@Body() addMemberDTO: AddMemberDto, @Param('ownerId') ownerId: number) {
        return await this.projectService.addMember(addMemberDTO, ownerId);
    }

    @Delete('/remove-member/:projectId/:memberId/:ownerId')
    @ApiOperation({ summary: 'Remove a member from a project' })
    @ApiParam({ name: 'projectId', description: 'The ID of the project' })
    @ApiParam({ name: 'memberId', description: 'The ID of the member to remove' })
    @ApiParam({ name: 'ownerId', description: 'The ID of the project owner' })
    @ApiResponse({ status: 200, description: 'Member removed successfully.' })
    @ApiResponse({ status: 404, description: 'Project or Member not found.' })
    async removeMember(
        @Param('projectId') projectId: number,
        @Param('memberId') memberId: number,
        @Param('ownerId') ownerId: number
    ) {
        return await this.projectService.removeMember(projectId, memberId, ownerId);
    }

    @Patch('/:projectId')
    @ApiOperation({ summary: 'Update project details' })
    @ApiParam({ name: 'projectId', description: 'The ID of the project to update' })
    @ApiResponse({ status: 200, description: 'Project updated successfully.' })
    @ApiResponse({ status: 400, description: 'Bad Request.' })
    @UsePipes(new ValidationPipe({ whitelist: true }))
    async update(
        @Param('projectId') projectId: number,
        @Body() updateProjectDto: UpdateProjectDto
    ) {
        return await this.projectService.update(projectId, updateProjectDto);
    }

    @Get()
    @ApiOperation({ summary: 'Get a list of projects with pagination' })
    @ApiQuery({ name: 'page', required: false, description: 'Page number for pagination', type: Number })
    @ApiQuery({ name: 'size', required: false, description: 'Number of projects per page', type: Number })
    @ApiResponse({ status: 200, description: 'Projects retrieved successfully.' })
    @ApiResponse({ status: 400, description: 'Bad Request.' })
    async findAll(
        @Query('page') page: number,
        @Query('size') size: number
    ) {
        if (isNaN(page) || isNaN(size) || page < 0 || size <= 0) {
            throw new BadRequestException('Invalid page or size parameters');
        }

        return await this.projectService.findAll(page, size);
    }

    @Get(':id')
    @ApiParam({ name: 'id', required: true, description: 'Project ID' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Successfully fetched project.' })
    @ApiNotFoundResponse({ description: 'Project not found.' })
    @ApiInternalServerErrorResponse({ description: 'Server error.' })
    async detail(@Param('id') id: number) {
        return await this.projectService.detail(+id);
    }

    @Delete(':id')
    @ApiParam({ name: 'id', required: true, description: 'Project ID' })
    @ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'Successfully deleted project.' })
    @ApiNotFoundResponse({ description: 'Project not found.' })
    @ApiInternalServerErrorResponse({ description: 'Server error.' })
    async delete(@Param('id') id: number) {
        return await this.projectService.delete(+id);
    }
}
