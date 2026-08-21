-- Suppression de l'ancienne colonne imageId sur recipe_steps
ALTER TABLE "recipe_steps" DROP COLUMN IF EXISTS "imageId";

-- Création de la table recipe_step_media
CREATE TABLE "recipe_step_media" (
  "id"        TEXT    NOT NULL,
  "stepId"    TEXT    NOT NULL,
  "mediaId"   TEXT    NOT NULL,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  CONSTRAINT "recipe_step_media_pkey" PRIMARY KEY ("id")
);

-- Clés étrangères
ALTER TABLE "recipe_step_media"
  ADD CONSTRAINT "recipe_step_media_stepId_fkey"
  FOREIGN KEY ("stepId") REFERENCES "recipe_steps"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "recipe_step_media"
  ADD CONSTRAINT "recipe_step_media_mediaId_fkey"
  FOREIGN KEY ("mediaId") REFERENCES "media"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
