-- Enums
CREATE TYPE "CommentStatus" AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE "QuestionStatus" AS ENUM ('pending', 'answered', 'rejected');
CREATE TYPE "ReactionEmoji" AS ENUM ('HEART', 'CLAP', 'YUM', 'FIRE');

-- Blog comments
CREATE TABLE "blog_comments" (
  "id"          TEXT NOT NULL,
  "postId"      TEXT NOT NULL,
  "authorName"  TEXT NOT NULL,
  "authorEmail" TEXT NOT NULL,
  "content"     TEXT NOT NULL,
  "parentId"    TEXT,
  "status"      "CommentStatus" NOT NULL DEFAULT 'pending',
  "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "blog_comments_pkey" PRIMARY KEY ("id")
);

-- Recipe comments
CREATE TABLE "recipe_comments" (
  "id"          TEXT NOT NULL,
  "recipeId"    TEXT NOT NULL,
  "authorName"  TEXT NOT NULL,
  "authorEmail" TEXT NOT NULL,
  "content"     TEXT NOT NULL,
  "parentId"    TEXT,
  "status"      "CommentStatus" NOT NULL DEFAULT 'pending',
  "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "recipe_comments_pkey" PRIMARY KEY ("id")
);

-- Recipe questions
CREATE TABLE "recipe_questions" (
  "id"          TEXT NOT NULL,
  "recipeId"    TEXT NOT NULL,
  "authorName"  TEXT NOT NULL,
  "authorEmail" TEXT NOT NULL,
  "question"    TEXT NOT NULL,
  "answer"      TEXT,
  "status"      "QuestionStatus" NOT NULL DEFAULT 'pending',
  "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "answeredAt"  TIMESTAMP(3),
  CONSTRAINT "recipe_questions_pkey" PRIMARY KEY ("id")
);

-- Article reactions
CREATE TABLE "article_reactions" (
  "id"     TEXT NOT NULL,
  "postId" TEXT NOT NULL,
  "emoji"  "ReactionEmoji" NOT NULL,
  "count"  INTEGER NOT NULL DEFAULT 0,
  CONSTRAINT "article_reactions_pkey" PRIMARY KEY ("id")
);

-- Recipe reactions
CREATE TABLE "recipe_reactions" (
  "id"       TEXT NOT NULL,
  "recipeId" TEXT NOT NULL,
  "emoji"    "ReactionEmoji" NOT NULL,
  "count"    INTEGER NOT NULL DEFAULT 0,
  CONSTRAINT "recipe_reactions_pkey" PRIMARY KEY ("id")
);

-- Unique constraints
ALTER TABLE "article_reactions" ADD CONSTRAINT "article_reactions_postId_emoji_key" UNIQUE ("postId", "emoji");
ALTER TABLE "recipe_reactions"  ADD CONSTRAINT "recipe_reactions_recipeId_emoji_key" UNIQUE ("recipeId", "emoji");

-- FK: blog_comments → blog_posts
ALTER TABLE "blog_comments" ADD CONSTRAINT "blog_comments_postId_fkey"
  FOREIGN KEY ("postId") REFERENCES "blog_posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "blog_comments" ADD CONSTRAINT "blog_comments_parentId_fkey"
  FOREIGN KEY ("parentId") REFERENCES "blog_comments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- FK: recipe_comments → recipes
ALTER TABLE "recipe_comments" ADD CONSTRAINT "recipe_comments_recipeId_fkey"
  FOREIGN KEY ("recipeId") REFERENCES "recipes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "recipe_comments" ADD CONSTRAINT "recipe_comments_parentId_fkey"
  FOREIGN KEY ("parentId") REFERENCES "recipe_comments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- FK: recipe_questions → recipes
ALTER TABLE "recipe_questions" ADD CONSTRAINT "recipe_questions_recipeId_fkey"
  FOREIGN KEY ("recipeId") REFERENCES "recipes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- FK: article_reactions → blog_posts
ALTER TABLE "article_reactions" ADD CONSTRAINT "article_reactions_postId_fkey"
  FOREIGN KEY ("postId") REFERENCES "blog_posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- FK: recipe_reactions → recipes
ALTER TABLE "recipe_reactions" ADD CONSTRAINT "recipe_reactions_recipeId_fkey"
  FOREIGN KEY ("recipeId") REFERENCES "recipes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
