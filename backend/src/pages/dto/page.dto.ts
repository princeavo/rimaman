import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsEnum,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  Max,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { PageBlockType, PageStatus } from '@prisma/client';

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export class CreatePageDto {
  @IsString()
  @Matches(SLUG_PATTERN, { message: 'Le slug ne doit contenir que des lettres minuscules, chiffres et tirets' })
  slug!: string;

  @IsString()
  @MinLength(2)
  title!: string;

  @IsOptional()
  @IsString()
  metaDescription?: string;

  @IsOptional()
  @IsEnum(PageStatus)
  status?: PageStatus;
}

export class UpdatePageDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  title?: string;

  @IsOptional()
  @IsString()
  metaDescription?: string;

  @IsOptional()
  @IsEnum(PageStatus)
  status?: PageStatus;
}

export class BlockInput {
  @IsEnum(PageBlockType)
  type!: PageBlockType;

  @IsObject()
  data!: Record<string, unknown>;

  @IsOptional()
  @IsUUID()
  mediaId?: string;
}

export class ColumnInput {
  @IsInt()
  @Min(1)
  @Max(12)
  width!: number;

  @IsOptional()
  @IsObject()
  settings?: Record<string, unknown>;

  @IsArray()
  @ArrayMaxSize(20)
  @ValidateNested({ each: true })
  @Type(() => BlockInput)
  blocks!: BlockInput[];
}

export class RowInput {
  @IsOptional()
  @IsObject()
  settings?: Record<string, unknown>;

  @IsArray()
  @ArrayMaxSize(6)
  @ValidateNested({ each: true })
  @Type(() => ColumnInput)
  columns!: ColumnInput[];
}

export class ReplacePageTreeDto {
  @IsArray()
  @ArrayMaxSize(40)
  @ValidateNested({ each: true })
  @Type(() => RowInput)
  rows!: RowInput[];
}
