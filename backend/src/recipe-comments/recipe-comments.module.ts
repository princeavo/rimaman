import { Module } from '@nestjs/common';
import { RecipeCommentsController } from './recipe-comments.controller';
import { RecipeCommentsService } from './recipe-comments.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [RecipeCommentsController],
  providers: [RecipeCommentsService],
})
export class RecipeCommentsModule {}
