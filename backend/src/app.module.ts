import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { validateEnv } from './config/env.validation';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { MediaModule } from './media/media.module';
import { ProductsModule } from './products/products.module';
import { RecipesModule } from './recipes/recipes.module';
import { LocationsModule } from './locations/locations.module';
import { LocationTypesModule } from './location-types/location-types.module';
import { FaqModule } from './faq/faq.module';
import { GalleryModule } from './gallery/gallery.module';
import { BlogModule } from './blog/blog.module';
import { ReviewsModule } from './reviews/reviews.module';
import { SettingsModule } from './settings/settings.module';
import { PagesModule } from './pages/pages.module';
import { OrdersModule } from './orders/orders.module';
import { ContactModule } from './contact/contact.module';
import { NotificationsModule } from './notifications/notifications.module';
import { NewsletterModule } from './newsletter/newsletter.module';
import { PromoCodesModule } from './promo-codes/promo-codes.module';
import { BlogCommentsModule } from './blog-comments/blog-comments.module';
import { RecipeCommentsModule } from './recipe-comments/recipe-comments.module';
import { RecipeQuestionsModule } from './recipe-questions/recipe-questions.module';
import { ReactionsModule } from './reactions/reactions.module';
import { AppController } from './app.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv,
    }),
    ThrottlerModule.forRoot([
      {
        name: 'default',
        ttl: 60_000,
        limit: 100,
      },
    ]),
    PrismaModule,
    AuthModule,
    MediaModule,
    ProductsModule,
    RecipesModule,
    LocationsModule,
    LocationTypesModule,
    FaqModule,
    GalleryModule,
    BlogModule,
    ReviewsModule,
    SettingsModule,
    PagesModule,
    NotificationsModule,
    OrdersModule,
    ContactModule,
    NewsletterModule,
    PromoCodesModule,
    BlogCommentsModule,
    RecipeCommentsModule,
    RecipeQuestionsModule,
    ReactionsModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
