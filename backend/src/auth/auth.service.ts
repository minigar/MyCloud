import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/data/database.service';
import { OAuthUser, Tokens } from './types';

import * as transliteration from 'transliteration';
import { UserBodyModel, UserDecoded } from 'src/models/User.dto';
import { validName, validPassw } from 'src/common/regex/user.regex';
import { BusinessError } from 'src/common/errors/businessErrors/businessError';
import { AuthErrorKey, UserErrorKey } from 'src/controllers/errorKeys';
import { JwtService } from '@nestjs/jwt';
import { v4 as uuid } from 'uuid';
import * as bcrypt from 'bcrypt';
import { User } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private readonly db: DatabaseService,
    private readonly jwtService: JwtService,
  ) {}

  async googleSignInOrSignUp(oAuthUser: OAuthUser) {
    let user: User;
    user = await this.db.user.findFirst({
      where: {
        email: oAuthUser.email,
      },
    });

    if (!user) {
      user = await this.db.user.create({
        data: {
          email: oAuthUser.email,
          name: transliteration.transliterate(oAuthUser.firstName),
        },
      });
    }

    const tokens = await this.getTokens(user.id, user.email, user.name);
    await this.updateRefreshTokenHash(user.id, tokens.refresh_token);
    console.log(tokens);
    return tokens;
  }

  async localSignUp({ name, email, password }: UserBodyModel): Promise<Tokens> {
    await validName(name);
    await validPassw(password);

    const password_hash = await this.hashData(password);
    const user = await this.db.user.findFirst({ where: { email } });

    if (user) {
      throw new BusinessError(AuthErrorKey.EMAIL_EXISTS);
    }

    const createdUser = await this.db.user.create({
      data: {
        name,
        email,
        localProfile: { create: { password: password_hash } },
      },
    });

    const tokens = await this.getTokens(
      createdUser.id,
      createdUser.email,
      createdUser.name,
    );

    await this.updateRefreshTokenHash(createdUser.id, tokens.refresh_token);

    return tokens;
  }

  async localSignIn(email: string, password: string): Promise<Tokens> {
    await validPassw(password);

    if (!email) {
      throw new BusinessError(AuthErrorKey.EMAIL_CAN_NOT_BE_EMPTY);
    }

    if (!password) {
      throw new BusinessError(AuthErrorKey.PASSWORD_CAN_NOT_BE_EMPTY);
    }

    const user = await this.db.user.findUnique({
      where: { email },
    });

    const userLocalProfile = await this.db.localProfile.findUnique({
      where: { userId: user.id },
    });

    if (!user) {
      throw new BusinessError(AuthErrorKey.EMAIL_BAD_REQUEST);
    }

    const isMatches = await bcrypt.compare(password, userLocalProfile.password);

    if (!isMatches) {
      throw new BusinessError(AuthErrorKey.PASSWORDS_ARE_NOT_SAME);
    }

    const tokens = await this.getTokens(user.id, user.email, user.name);
    await this.updateRefreshTokenHash(user.id, tokens.refresh_token);
    return tokens;
  }

  async logout(userId: number) {
    const user = await this.db.user.findFirst({ where: { id: userId } });

    if (!user) throw new BusinessError(UserErrorKey.USER_NOT_FOUND);

    if (user.hashedRT === null) {
      throw new BusinessError(AuthErrorKey.HASHED_RT_NON_EXISTENT);
    }

    await this.db.user.updateMany({
      where: { id: userId },
      data: { hashedRT: null },
    });

    return true;
  }

  async refresh(userId: number, refreshToken: string): Promise<Tokens> {
    const user = await this.db.user.findFirst({
      where: { id: userId },
    });

    if (!user) throw new BusinessError(UserErrorKey.USER_NOT_FOUND);

    if (!user.hashedRT)
      throw new BusinessError(AuthErrorKey.HASHED_RT_NON_EXISTENT);

    let decoded: UserDecoded;
    try {
      decoded = await this.jwtService.verify(refreshToken, {
        secret: process.env.REFRESH_SECRET,
      });
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        throw new BusinessError(AuthErrorKey.EXPIRED_TOKEN);
      }
      if (err.name === 'JsonWebTokenError') {
        throw new BusinessError(AuthErrorKey.TOKEN_INVALID_SIGNATURE);
      } else {
        throw new BusinessError(err.name);
      }
    }

    const isMatches = await bcrypt.compare(
      decoded.refreshTokenId,
      user.hashedRT,
    );

    if (!isMatches) throw new BusinessError(AuthErrorKey.TOKENS_ARE_NOT_SAME);

    await this.db.user.update({
      where: { email: user.email },
      data: {
        hashedRT: null,
      },
    });

    const tokens = await this.getTokens(user.id, user.email, user.name);
    await this.updateRefreshTokenHash(user.id, tokens.refresh_token);
    return tokens;
  }

  async hashData(data: any) {
    return await bcrypt.hash(data, 10);
  }

  async getTokens(
    userId: number,
    email: string,
    name: string,
  ): Promise<Tokens> {
    const refreshTokenId = await uuid();
    const [access_token, refresh_token] = await Promise.all([
      await this.jwtService.signAsync(
        {
          userId,
          name,
          email,
        },
        {
          secret: process.env.SECRET || 'secret',
          expiresIn: '1d',
        },
      ),
      await this.jwtService.signAsync(
        {
          userId,
          name,
          email,
          refreshTokenId,
        },
        {
          secret: process.env.REFRESH_SECRET || 'secret',
          expiresIn: '1d',
        },
      ),
    ]);
    return {
      access_token,
      refresh_token,
    };
  }

  async updateRefreshTokenHash(userId: number, refresh_token: string) {
    if (!userId) {
      throw new BusinessError(UserErrorKey.USER_NOT_FOUND);
    }

    const decoded = <UserDecoded>await this.jwtService.verify(refresh_token, {
      secret: process.env.REFRESH_SECRET,
    });

    const refreshTokenId = decoded.refreshTokenId;

    const hash = await this.hashData(refreshTokenId); //TODO

    await this.db.user.update({
      where: {
        id: userId,
      },
      data: {
        hashedRT: hash,
      },
    });
  }
}
