import { IsInt, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateLocationTypeDto {
  @IsString()
  @MinLength(2)
  label!: string;

  @IsOptional()
  @IsInt()
  sortOrder?: number;
}

export class UpdateLocationTypeDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  label?: string;

  @IsOptional()
  @IsInt()
  sortOrder?: number;
}
