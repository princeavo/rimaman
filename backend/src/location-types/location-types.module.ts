import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { LocationTypesController } from './location-types.controller';
import { LocationTypesService } from './location-types.service';

@Module({
  imports: [AuthModule],
  controllers: [LocationTypesController],
  providers: [LocationTypesService],
})
export class LocationTypesModule {}
