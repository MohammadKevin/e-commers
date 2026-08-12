import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { CartModule } from './cart/cart.module';
import { OrdersModule } from './orders/orders.module';
import { PaymentsModule } from './payments/payments.module';
import { PrismaModule } from './prisma/prisma.module';
import { ProductsModule } from './products/products.module';
import { ReviewsModule } from './reviews/reviews.module';
import { ShippingModule } from './shipping/shipping.module';
import { StoresModule } from './stores/stores.module';
import { UploadsModule } from './uploads/uploads.module';
import { UsersModule } from './users/users.module';
import { VouchersModule } from './vouchers/vouchers.module';
import { WishlistsModule } from './wishlists/wishlists.module';
import { SellerApplicationsModule } from './seller-applications/seller-applications.module';
import { TicketsModule } from './tickets/tickets.module';
import { CategoriesModule } from './categories/categories.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ScheduleModule.forRoot(),
    PrismaModule,
    AuthModule,
    UsersModule,
    StoresModule,
    ProductsModule,
    CartModule,
    OrdersModule,
    PaymentsModule,
    ShippingModule,
    VouchersModule,
    ReviewsModule,
    WishlistsModule,
    UploadsModule,
    SellerApplicationsModule,
    TicketsModule,
    CategoriesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
