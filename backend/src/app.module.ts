import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { LanguagesModule } from './modules/languages/languages.module';
import { CoursesModule } from './modules/courses/courses.module';
import { LevelsModule } from './modules/levels/levels.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { SkillsModule } from './modules/skills/skills.module';
import { TopicsModule } from './modules/topics/topics.module';
import { ResourceTypesModule } from './modules/resource-types/resource-types.module';
import { SourcesModule } from './modules/sources/sources.module';
import { ResourcesModule } from './modules/resources/resources.module';
import { AiModule } from './modules/ai/ai.module';
import { FilesModule } from './modules/files/files.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    LanguagesModule,
    CoursesModule,
    LevelsModule,
    CategoriesModule,
    SkillsModule,
    TopicsModule,
    ResourceTypesModule,
    SourcesModule,
    ResourcesModule,
    AiModule,
    FilesModule,
  ],
})
export class AppModule {}









