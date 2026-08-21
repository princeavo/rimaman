import { Module } from '@nestjs/common';
import { RecipeQuestionsController } from './recipe-questions.controller';
import { RecipeQuestionsService } from './recipe-questions.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [RecipeQuestionsController],
  providers: [RecipeQuestionsService],
})
export class RecipeQuestionsModule {}
