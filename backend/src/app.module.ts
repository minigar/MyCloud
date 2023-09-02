import { Module } from '@nestjs/common';
import { DatabaseModule } from './data/database.module';
import { ConfigModule } from '@nestjs/config';
import { ControllersModule } from './controllers/controllers.module';
import { ServiceModule } from './services/services.module';

@Module({
  imports: [DatabaseModule, ControllersModule, ServiceModule, ConfigModule],
})
export class AppModule {}
