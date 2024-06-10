import { Module } from '@nestjs/common';
import {UserModule} from "./user/user.module";
import {ProjectModule} from "./project/project.module";
import {TaskModule} from "./task/task.module";
import {TagModule} from "./tag/tag.module";

@Module({
  imports: [UserModule, ProjectModule, TaskModule, TagModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
