import { Module } from '@nestjs/common';
import { BlogCommentsController } from './blog-comments.controller';
import { BlogCommentsService } from './blog-comments.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [BlogCommentsController],
  providers: [BlogCommentsService],
})
export class BlogCommentsModule {}
