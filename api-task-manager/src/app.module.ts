import { Module } from '@nestjs/common';
import {UserModule} from "./user/user.module";
import {ProjectModule} from "./project/project.module";
import {TaskModule} from "./task/task.module";
import {TagModule} from "./tag/tag.module";
import {HealthModule} from "./health/health.module";

@Module({
  imports: [UserModule, ProjectModule, TaskModule, TagModule, HealthModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
