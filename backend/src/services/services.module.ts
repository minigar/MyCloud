import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from 'src/data/database.module';
import { UserService } from './user.service';
import { FilesService } from './files.service';

@Module({
  imports: [ConfigModule, DatabaseModule],
  exports: [UserService, FilesService],
  providers: [UserService, FilesService],
})
export class ServiceModule {}
