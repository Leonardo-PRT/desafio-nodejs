import {ApiOperation, ApiTags} from "@nestjs/swagger";
import {Body, Controller, Post, UsePipes, ValidationPipe} from "@nestjs/common";
import {CreateProjectDto} from "./create-project.dto";
import {ProjectService} from "./project.service";

@ApiTags('Project')
@Controller("project")
export class ProjectController{
    constructor(private readonly projectService: ProjectService) {}


    @Post()
    @ApiOperation({ summary: 'Create a new user' })
    @UsePipes(new ValidationPipe({ whitelist: true }))
    async create(@Body() projectDTO: CreateProjectDto) {
        return await this.projectService.create(projectDTO);
    }

}