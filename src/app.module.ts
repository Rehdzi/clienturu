import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { SequelizeModule } from '@nestjs/sequelize';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { AuthModule } from './auth/auth.module';
import { Role } from './roles/roles.model';
import { RolesModule } from './roles/roles.module';
import { UserRoles } from './roles/user-roles-model';
import { User } from './users/users/users.model';
import { UsersModule } from './users/users/users.module';
import { OrganizationModule } from './organization/organization.module';
import { Organization } from './organization/organization.model';
import { ServicesModule } from './services/services.module';
import { Service } from './services/service.model';
import { StaffModule } from './staff/staff.module';
import { OrganizationStaff } from './staff/organization-staff.model';
import { StaffService } from './staff/staff-service.model';
import { Schedule } from './staff/schedule.model';
import { BookingsModule } from './bookings/bookings.module';
import { Booking } from './bookings/booking.model';
import { ReviewsModule } from './reviews/reviews.module';
import { Review } from './reviews/review.model';
import { AddressesModule } from './addresses/addresses.module';
import { Address } from './addresses/address.model';
import { OwnerApplicationsModule } from './owner-applications/owner-applications.module';
import { OwnerApplication } from './owner-applications/owner-application.model';

@Module({
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60_000,
        limit: 100,
      },
    ]),
    SequelizeModule.forRoot({
      dialect: 'postgres',
      host: process.env.POSTGRES_HOST,
      port: Number(process.env.POSTGRES_PORT),
      username: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_DB,
      models: [
        User,
        Role,
        UserRoles,
        Organization,
        Service,
        OrganizationStaff,
        StaffService,
        Schedule,
        Booking,
        Review,
        Address,
        OwnerApplication,
      ],
      autoLoadModels: true,
    }),
    UsersModule,
    RolesModule,
    AuthModule,
    OrganizationModule,
    ServicesModule,
    StaffModule,
    BookingsModule,
    ReviewsModule,
    AddressesModule,
    OwnerApplicationsModule,
  ],
})
export class AppModule {}
