import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { MediaModule } from '../media/media.module';
import { BlogController } from './blog.controller';
import { BlogService } from './blog.service';
import { TiptapResolverService } from './tiptap-resolver.service';

@Module({
  imports: [AuthModule, MediaModule],
  controllers: [BlogController],
  providers: [BlogService, TiptapResolverService],
})
export class BlogModule {}
