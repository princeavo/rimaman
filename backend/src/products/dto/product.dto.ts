import {
  IsArray,
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  MinLength,
} from 'class-validator';

// ── Variante ──────────────────────────────────────────────────────────────────

export class CreateProductVariantDto {
  @IsString()
  weight!: string;

  @IsInt()
  @Min(0)
  price!: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  stock?: number;

  @IsBoolean()
  isDefault!: boolean;

  @IsOptional()
  @IsInt()
  sortOrder?: number;

  @IsOptional()
  @IsUUID()
  imageId?: string;
}

export class UpdateProductVariantDto {
  @IsOptional()
  @IsString()
  weight?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  price?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  stock?: number;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;

  @IsOptional()
  @IsInt()
  sortOrder?: number;

  @IsOptional()
  @IsUUID()
  imageId?: string;
}

// ── Produit ───────────────────────────────────────────────────────────────────

export class CreateProductDto {
  @IsString()
  @MinLength(2)
  name!: string;

  @IsOptional()
  @IsString()
  slug?: string;

  @IsString()
  @MinLength(10)
  description!: string;

  @IsInt()
  @Min(0)
  price!: number;

  @IsString()
  weight!: string;

  @IsUUID()
  categoryId!: string;

  @IsArray()
  @IsString({ each: true })
  features!: string[];

  @IsOptional()
  @IsBoolean()
  isBestseller?: boolean;

  @IsOptional()
  @IsArray()
  nutrition?: object[];

  @IsOptional()
  @IsInt()
  @Min(1)
  servings?: number;

  @IsOptional()
  @IsString()
  storageInfo?: string;

  @IsOptional()
  @IsString()
  allergens?: string;

  @IsOptional()
  @IsUUID()
  imageId?: string;
}

export class UpdateProductDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  name?: string;

  @IsOptional()
  @IsString()
  slug?: string;

  @IsOptional()
  @IsString()
  @MinLength(10)
  description?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  price?: number;

  @IsOptional()
  @IsString()
  weight?: string;

  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  features?: string[];

  @IsOptional()
  @IsBoolean()
  isBestseller?: boolean;

  @IsOptional()
  @IsArray()
  nutrition?: object[];

  @IsOptional()
  @IsInt()
  @Min(1)
  servings?: number;

  @IsOptional()
  @IsString()
  storageInfo?: string;

  @IsOptional()
  @IsString()
  allergens?: string;

  @IsOptional()
  @IsUUID()
  imageId?: string;
}

// ── Catégorie produit ─────────────────────────────────────────────────────────

export class CreateProductCategoryDto {
  @IsString()
  @MinLength(2)
  name!: string;

  @IsOptional()
  @IsString()
  icon?: string;

  @IsOptional()
  @IsInt()
  sortOrder?: number;
}

export class UpdateProductCategoryDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  name?: string;

  @IsOptional()
  @IsString()
  icon?: string;

  @IsOptional()
  @IsInt()
  sortOrder?: number;
}
