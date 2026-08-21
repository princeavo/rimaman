import {
  ArrayNotEmpty,
  IsArray,
  IsDateString,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

class ReorderEntryDto {
  @IsUUID() id!: string;
  @IsInt() sortOrder!: number;
}

// ── Catégories ────────────────────────────────────────────────────────────────

export class CreateBlogCategoryDto {
  @IsString() @MinLength(1) @MaxLength(80) name!: string;
  @IsOptional() @IsInt() sortOrder?: number;
}

export class UpdateBlogCategoryDto {
  @IsOptional() @IsString() @MinLength(1) @MaxLength(80) name?: string;
  @IsOptional() @IsInt() sortOrder?: number;
}

export class ReorderBlogCategoriesDto {
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => ReorderEntryDto)
  items!: ReorderEntryDto[];
}

// ── Articles ─────────────────────────────────────────────────────────────────

export class CreateBlogPostDto {
  @IsString() @MinLength(3) title!: string;

  @IsString()
  @Matches(SLUG_PATTERN, {
    message: 'Le slug ne doit contenir que des lettres minuscules, chiffres et tirets',
  })
  slug!: string;

  @IsString() @MinLength(10) excerpt!: string;

  @IsObject() content!: Record<string, unknown>;

  @IsUUID() categoryId!: string;

  @IsOptional() @IsUUID() imageId?: string;

  @IsOptional() @IsDateString() publishedAt?: string;
}

export class UpdateBlogPostDto {
  @IsOptional() @IsString() @MinLength(3) title?: string;

  @IsOptional()
  @IsString()
  @Matches(SLUG_PATTERN, {
    message: 'Le slug ne doit contenir que des lettres minuscules, chiffres et tirets',
  })
  slug?: string;

  @IsOptional() @IsString() @MinLength(10) excerpt?: string;

  @IsOptional() @IsObject() content?: Record<string, unknown>;

  @IsOptional() @IsUUID() categoryId?: string;

  @IsOptional() @IsUUID() imageId?: string;

  @IsOptional() @IsDateString() publishedAt?: string;
}
