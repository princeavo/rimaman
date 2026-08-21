-- Replace RecipeCategory and RecipeDifficulty enums with proper tables.
-- Data is preserved by matching existing enum string values to new row names.

-- CreateTable recipe_categories
CREATE TABLE "recipe_categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "icon" TEXT NOT NULL DEFAULT 'restaurant',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "recipe_categories_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "recipe_categories_name_key" ON "recipe_categories"("name");

-- CreateTable recipe_difficulties
CREATE TABLE "recipe_difficulties" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT NOT NULL DEFAULT 'green',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "recipe_difficulties_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "recipe_difficulties_name_key" ON "recipe_difficulties"("name");

-- Seed initial categories (matching existing enum values)
INSERT INTO "recipe_categories" ("id", "name", "icon", "sortOrder") VALUES
    (gen_random_uuid()::text, 'fufu',     'restaurant',       0),
    (gen_random_uuid()::text, 'beignets', 'bakery_dining',    1),
    (gen_random_uuid()::text, 'pain',     'breakfast_dining', 2),
    (gen_random_uuid()::text, 'desserts', 'cake',             3);

-- Seed initial difficulties (matching existing enum values)
INSERT INTO "recipe_difficulties" ("id", "name", "color", "sortOrder") VALUES
    (gen_random_uuid()::text, 'Facile',   'green', 0),
    (gen_random_uuid()::text, 'Moyen',    'amber', 1),
    (gen_random_uuid()::text, 'Difficile','red',   2);

-- Add FK columns (nullable first to allow data migration)
ALTER TABLE "recipes" ADD COLUMN "categoryId"   TEXT;
ALTER TABLE "recipes" ADD COLUMN "difficultyId" TEXT;

-- Populate FK columns from existing enum string values
UPDATE "recipes" r SET "categoryId"   = rc.id FROM "recipe_categories"  rc WHERE rc."name" = r."category"::text;
UPDATE "recipes" r SET "difficultyId" = rd.id FROM "recipe_difficulties" rd WHERE rd."name" = r."difficulty"::text;

-- Make FK columns NOT NULL
ALTER TABLE "recipes" ALTER COLUMN "categoryId"   SET NOT NULL;
ALTER TABLE "recipes" ALTER COLUMN "difficultyId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "recipes" ADD CONSTRAINT "recipes_categoryId_fkey"
    FOREIGN KEY ("categoryId") REFERENCES "recipe_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "recipes" ADD CONSTRAINT "recipes_difficultyId_fkey"
    FOREIGN KEY ("difficultyId") REFERENCES "recipe_difficulties"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Drop old enum columns
ALTER TABLE "recipes" DROP COLUMN "category";
ALTER TABLE "recipes" DROP COLUMN "difficulty";

-- Drop enums
DROP TYPE "RecipeCategory";
DROP TYPE "RecipeDifficulty";
