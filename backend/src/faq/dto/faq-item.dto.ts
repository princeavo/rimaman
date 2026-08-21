import {
  ArrayNotEmpty,
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class ReorderEntryDto {
  @IsUUID() id!: string;
  @IsInt() sortOrder!: number;
}

// ── Catégories ────────────────────────────────────────────────────────────────

export class CreateFaqCategoryDto {
  @IsString() @MinLength(1) @MaxLength(80) name!: string;
  @IsOptional() @IsString() @MaxLength(60) icon?: string;
  @IsOptional() @IsInt() sortOrder?: number;
}

export class UpdateFaqCategoryDto {
  @IsOptional() @IsString() @MinLength(1) @MaxLength(80) name?: string;
  @IsOptional() @IsString() @MaxLength(60) icon?: string;
  @IsOptional() @IsInt() sortOrder?: number;
}

export class ReorderFaqCategoriesDto {
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => ReorderEntryDto)
  items!: ReorderEntryDto[];
}

// ── Items ─────────────────────────────────────────────────────────────────────

export class CreateFaqItemDto {
  @IsUUID() categoryId!: string;
  @IsString() @MinLength(5) question!: string;
  @IsString() @MinLength(5) answer!: string;
  @IsOptional() @IsInt() sortOrder?: number;
}

export class UpdateFaqItemDto {
  @IsOptional() @IsUUID() categoryId?: string;
  @IsOptional() @IsString() @MinLength(5) question?: string;
  @IsOptional() @IsString() @MinLength(5) answer?: string;
  @IsOptional() @IsInt() sortOrder?: number;
}

export class ReorderFaqDto {
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => ReorderEntryDto)
  items!: ReorderEntryDto[];
}
