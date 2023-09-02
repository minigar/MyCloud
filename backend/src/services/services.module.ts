import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from 'src/data/database.module';
import { UserService } from './user.service';

@Module({
  imports: [ConfigModule, DatabaseModule],
  exports: [UserService],
  providers: [UserService],
})
export class ServiceModule {}
