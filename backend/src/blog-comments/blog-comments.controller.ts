import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { BlogCommentsService } from './blog-comments.service';
import { CreateBlogCommentDto } from './dto/blog-comment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('blog-comments')
export class BlogCommentsController {
  constructor(private readonly service: BlogCommentsService) {}

  @Post(':postId')
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  create(@Param('postId') postId: string, @Body() dto: CreateBlogCommentDto) {
    return this.service.create(postId, dto);
  }

  @Get()
  findByPost(@Query('postId') postId: string) {
    return this.service.findByPost(postId);
  }

  @Get('admin')
  @UseGuards(JwtAuthGuard)
  findAllAdmin(@Query('status') status?: string) {
    return this.service.findAllAdmin(status);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard)
  updateStatus(@Param('id') id: string, @Body('status') status: 'pending' | 'approved' | 'rejected') {
    return this.service.updateStatus(id, status);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
