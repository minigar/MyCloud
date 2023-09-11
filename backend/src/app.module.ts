import { Module } from '@nestjs/common';
import { DatabaseModule } from './data/database.module';
import { ConfigModule } from '@nestjs/config';
import { ControllersModule } from './controllers/controllers.module';
import { ServiceModule } from './services/services.module';
import { AuthUtilsModule } from './auth/auth-utils.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    DatabaseModule,
    ControllersModule,
    ServiceModule,
    ConfigModule,
    AuthUtilsModule,
    AuthModule,
  ],
})
export class AppModule {}
