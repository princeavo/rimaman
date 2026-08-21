import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { LocationTypesService } from './location-types.service';
import { CreateLocationTypeDto, UpdateLocationTypeDto } from './dto/location-type.dto';

@Controller('location-types')
export class LocationTypesController {
  constructor(private readonly locationTypesService: LocationTypesService) {}

  @Get()
  findAll() {
    return this.locationTypesService.findAll();
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() dto: CreateLocationTypeDto) {
    return this.locationTypesService.create(dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateLocationTypeDto) {
    return this.locationTypesService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.locationTypesService.remove(id);
  }
}
