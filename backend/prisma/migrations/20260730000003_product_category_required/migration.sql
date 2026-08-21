-- Créer la catégorie "Farines" si elle n'existe pas encore
INSERT INTO "product_categories" (id, name, icon, "sortOrder", "createdAt")
VALUES (gen_random_uuid(), 'Farines', 'grain', 0, NOW())
ON CONFLICT (name) DO NOTHING;

-- Rattacher les produits sans catégorie à "Farines"
UPDATE "products"
SET "categoryId" = (SELECT id FROM "product_categories" WHERE name = 'Farines' LIMIT 1)
WHERE "categoryId" IS NULL;

-- Rendre categoryId obligatoire
ALTER TABLE "products" ALTER COLUMN "categoryId" SET NOT NULL;

-- Supprimer le champ legacy
ALTER TABLE "products" DROP COLUMN "category";
