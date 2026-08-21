import {
  ArrayNotEmpty,
  IsArray,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

// ── Catégories ────────────────────────────────────────────────────────────────

export class CreateGalleryCategoryDto {
  @IsString()
  @MinLength(1)
  @MaxLength(80)
  name!: string;

  @IsOptional()
  @IsInt()
  sortOrder?: number;
}

export class UpdateGalleryCategoryDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(80)
  name?: string;

  @IsOptional()
  @IsInt()
  sortOrder?: number;
}

export class ReorderCategoryEntryDto {
  @IsUUID()
  id!: string;

  @IsInt()
  sortOrder!: number;
}

export class ReorderCategoriesDto {
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => ReorderCategoryEntryDto)
  items!: ReorderCategoryEntryDto[];
}

// ── Items ─────────────────────────────────────────────────────────────────────

export class CreateGalleryItemDto {
  @IsUUID()
  mediaId!: string;

  @IsUUID()
  categoryId!: string;

  @IsOptional()
  @IsInt()
  sortOrder?: number;
}

export class UpdateGalleryItemDto {
  @IsOptional()
  @IsUUID()
  mediaId?: string;

  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @IsOptional()
  @IsInt()
  sortOrder?: number;
}

export class ReorderEntryDto {
  @IsUUID()
  id!: string;

  @IsInt()
  sortOrder!: number;
}

export class ReorderGalleryDto {
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => ReorderEntryDto)
  items!: ReorderEntryDto[];
}

export class RenameCategoryDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(80)
  from!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(80)
  to!: string;
}
