import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';
import { CurrentUser } from 'src/common/decorators';
import { OAuthUser, Tokens } from './types';
import { AccessTokenGuard, GoogleGuard } from 'src/common/guards';
import { UserBodyModel, UserDecoded } from 'src/models/User.dto';
import { ApiBearerAuth, ApiBody } from '@nestjs/swagger';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('google')
  @UseGuards(GoogleGuard)
  async googleAuth() {}

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(
    @CurrentUser() user: OAuthUser,
    @Res() res: Response,
  ) {
    return await this.authService.googleSignInOrSignUp(user, res);
  }

  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  async localSingUp(
    @Body() { name, email, password }: UserBodyModel,
  ): Promise<Tokens> {
    return await this.authService.localSignUp({
      name,
      email,
      password,
    });
  }

  @Post('signin')
  @HttpCode(HttpStatus.OK)
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string' },
        password: { type: 'string' },
      },
    },
  })
  async localSignIn(
    @Body('email') email: string,
    @Body('password') password: string,
  ): Promise<Tokens> {
    return await this.authService.localSignIn(email, password);
  }

  @Post('logout')
  @ApiBearerAuth()
  @UseGuards(AccessTokenGuard)
  @HttpCode(HttpStatus.OK)
  async logout(@CurrentUser() user: UserDecoded) {
    console.log(user);
    return await this.authService.logout(user.userId);
  }

  @Post('refresh')
  @ApiBearerAuth()
  @UseGuards(AccessTokenGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBody({
    schema: {
      example: 'refreshToken',
      properties: {
        refreshToken: { type: 'string' },
      },
    },
  })
  async refresh(
    @CurrentUser() { userId },
    @Body() { refreshToken },
  ): Promise<Tokens> {
    return await this.authService.refresh(userId, refreshToken);
  }
}
