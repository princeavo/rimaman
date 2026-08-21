import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

// ── Catégories ────────────────────────────────────────────────────────────────

export class CreateRecipeCategoryDto {
  @IsString() @MinLength(1) @MaxLength(80) name!: string;
  @IsOptional() @IsString() @MaxLength(50) icon?: string;
  @IsOptional() @IsInt() sortOrder?: number;
}

export class UpdateRecipeCategoryDto {
  @IsOptional() @IsString() @MinLength(1) @MaxLength(80) name?: string;
  @IsOptional() @IsString() @MaxLength(50) icon?: string;
  @IsOptional() @IsInt() sortOrder?: number;
}

// ── Niveaux de difficulté ─────────────────────────────────────────────────────

export class CreateRecipeDifficultyDto {
  @IsString() @MinLength(1) @MaxLength(80) name!: string;
  @IsOptional() @IsString() @MaxLength(30) color?: string;
  @IsOptional() @IsInt() sortOrder?: number;
}

export class UpdateRecipeDifficultyDto {
  @IsOptional() @IsString() @MinLength(1) @MaxLength(80) name?: string;
  @IsOptional() @IsString() @MaxLength(30) color?: string;
  @IsOptional() @IsInt() sortOrder?: number;
}

// ── Recettes ──────────────────────────────────────────────────────────────────

export class RecipeIngredientInput {
  @IsString()
  @MinLength(1)
  item!: string;

  @IsString()
  @MinLength(1)
  quantity!: string;

  @IsOptional()
  @IsInt()
  sortOrder?: number;
}

export class RecipeStepMediaInput {
  @IsUUID()
  mediaId!: string;

  @IsOptional()
  @IsInt()
  sortOrder?: number;
}

export class RecipeStepInput {
  @IsInt()
  @Min(1)
  step!: number;

  @IsString()
  @MinLength(3)
  instruction!: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RecipeStepMediaInput)
  media?: RecipeStepMediaInput[];
}

export class CreateRecipeDto {
  @IsString()
  @MinLength(3)
  title!: string;

  @IsString()
  @Matches(SLUG_PATTERN, { message: 'Le slug ne doit contenir que des lettres minuscules, chiffres et tirets' })
  slug!: string;

  @IsString()
  @MinLength(10)
  description!: string;

  @IsUUID()
  categoryId!: string;

  @IsUUID()
  difficultyId!: string;

  @IsInt()
  @Min(0)
  prepTime!: number;

  @IsInt()
  @Min(0)
  cookTime!: number;

  @IsInt()
  @Min(1)
  servings!: number;

  @IsArray()
  @IsString({ each: true })
  tips!: string[];

  @IsOptional()
  @IsUUID()
  imageId?: string;

  @IsOptional()
  @IsUUID()
  videoId?: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => RecipeIngredientInput)
  ingredients!: RecipeIngredientInput[];

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => RecipeStepInput)
  steps!: RecipeStepInput[];

  @IsOptional()
  @IsArray()
  @IsUUID(undefined, { each: true })
  relatedProductIds?: string[];
}

export class UpdateRecipeDto {
  @IsOptional()
  @IsString()
  @MinLength(3)
  title?: string;

  @IsOptional()
  @IsString()
  @Matches(SLUG_PATTERN, { message: 'Le slug ne doit contenir que des lettres minuscules, chiffres et tirets' })
  slug?: string;

  @IsOptional()
  @IsString()
  @MinLength(10)
  description?: string;

  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @IsOptional()
  @IsUUID()
  difficultyId?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  prepTime?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  cookTime?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  servings?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tips?: string[];

  @IsOptional()
  @IsUUID()
  imageId?: string;

  @IsOptional()
  @IsUUID()
  videoId?: string;

  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => RecipeIngredientInput)
  ingredients?: RecipeIngredientInput[];

  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => RecipeStepInput)
  steps?: RecipeStepInput[];

  @IsOptional()
  @IsArray()
  @IsUUID(undefined, { each: true })
  relatedProductIds?: string[];
}
