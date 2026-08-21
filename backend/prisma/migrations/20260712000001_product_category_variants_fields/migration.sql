-- CreateTable: product_categories
CREATE TABLE "product_categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "icon" TEXT NOT NULL DEFAULT 'category',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "product_categories_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "product_categories_name_key" ON "product_categories"("name");

-- AlterTable: products — nouveaux champs optionnels (non breaking)
ALTER TABLE "products"
    ADD COLUMN "slug"        TEXT,
    ADD COLUMN "nutrition"   JSONB,
    ADD COLUMN "servings"    INTEGER,
    ADD COLUMN "storageInfo" TEXT,
    ADD COLUMN "allergens"   TEXT,
    ADD COLUMN "categoryId"  TEXT;

-- CreateIndex: slug unique (nullable — les produits existants ont slug NULL)
CREATE UNIQUE INDEX "products_slug_key" ON "products"("slug");

-- AddForeignKey: products.categoryId → product_categories.id
ALTER TABLE "products" ADD CONSTRAINT "products_categoryId_fkey"
    FOREIGN KEY ("categoryId") REFERENCES "product_categories"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateTable: product_variants
CREATE TABLE "product_variants" (
    "id"        TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "weight"    TEXT NOT NULL,
    "price"     INTEGER NOT NULL,
    "stock"     INTEGER,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "imageId"   TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "product_variants_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey: product_variants.productId
ALTER TABLE "product_variants" ADD CONSTRAINT "product_variants_productId_fkey"
    FOREIGN KEY ("productId") REFERENCES "products"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey: product_variants.imageId
ALTER TABLE "product_variants" ADD CONSTRAINT "product_variants_imageId_fkey"
    FOREIGN KEY ("imageId") REFERENCES "media"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;
