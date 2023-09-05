import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import {
  AccessTokenStrategy,
  GoogleStrategy,
  RefreshTokenStrategy,
} from './strategies';

@Module({
  imports: [PassportModule.register({ defaultStrategy: 'jwt' })],
  providers: [GoogleStrategy, AccessTokenStrategy, RefreshTokenStrategy],
})
export class AuthUtilsModule {}
