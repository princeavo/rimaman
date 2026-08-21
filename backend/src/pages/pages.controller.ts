import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PagesService } from './pages.service';
import { CreatePageDto, ReplacePageTreeDto, UpdatePageDto } from './dto/page.dto';

@Controller('pages')
export class PagesController {
  constructor(private readonly pagesService: PagesService) {}

  @Get('admin/all')
  @UseGuards(JwtAuthGuard)
  findAllForAdmin() {
    return this.pagesService.findAllForAdmin();
  }

  @Get('admin/:id')
  @UseGuards(JwtAuthGuard)
  findOneForAdmin(@Param('id', ParseUUIDPipe) id: string) {
    return this.pagesService.findOneForAdmin(id);
  }

  @Get(':slug')
  findPublishedBySlug(@Param('slug') slug: string) {
    return this.pagesService.findPublishedBySlug(slug);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() dto: CreatePageDto) {
    return this.pagesService.create(dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdatePageDto) {
    return this.pagesService.update(id, dto);
  }

  @Put(':id/tree')
  @UseGuards(JwtAuthGuard)
  replaceTree(@Param('id', ParseUUIDPipe) id: string, @Body() dto: ReplacePageTreeDto) {
    return this.pagesService.replaceTree(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.pagesService.remove(id);
  }
}
