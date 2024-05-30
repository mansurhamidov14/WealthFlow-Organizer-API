import { PrismaService } from '@app/prisma/prisma.service';
import { UserId } from '@app/user/user.dto';
import { ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { hash as createHash, verify as verifyPassword } from 'argon2';
import { AuthDto, SignUpDto } from './auth.dto';
const md5 = require('md5');

@Injectable()
export class AuthService {
  private static EMAIL_ALREADY_TAKEN_ERROR = 'EmailAlreadyTaken'
  private static INVALID_CREDENTIALS_ERROR = 'InvalidCredentials';
  constructor(private prisma: PrismaService, private jwt: JwtService, private config: ConfigService) {}

  async signIn(dto: AuthDto) {
    // find user with email
    const user = await this.prisma.user.findUnique({
      where: {
        email: dto.email
      }
    });
    // if user does not exist throw an error
    if (!user) {
      throw new ForbiddenException(AuthService.INVALID_CREDENTIALS_ERROR);
    }

    // if user exists we verifty password
    const passwordMatches = await verifyPassword(user.hash, dto.password);

    // throw an error if password is incorrect
    if (!passwordMatches) {
      throw new ForbiddenException(AuthService.INVALID_CREDENTIALS_ERROR)
    }

    const tokens = await this.signTokens(user.id, user.email);
    delete user.hash;

    return {
      user,
      ...tokens
    };
  }

  async signUp(dto: SignUpDto) {
    // generate the password hash
    const hash = await createHash(dto.password);

    try {
      // save a new user to db
      const user = await this.prisma.user.create({
        data: {
          avatar: dto.avatar,
          email: dto.email,
          hash,
          firstName: dto.firstName,
          lastName: dto.lastName,
          hasPinProtection: false,
          primaryCurrency: dto.primaryCurrency,
          createdAt: new Date()
        }
      });

      // return the saved user
      delete user.hash;
      delete user.pinHash;
      const { access_token, refresh_token } = await this.signTokens(user.id, user.email);
      return { user, access_token, refresh_token };
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ForbiddenException(AuthService.EMAIL_ALREADY_TAKEN_ERROR);
      }

      throw error;
    }
  }

  async refreshToken(userId: UserId, email: string, token: string) {
    const tokenHash = md5(token);
    const where = { userId, tokenHash }
    const activeToken = await this.prisma.usersRefreshTokens.findFirst({ where });

    if (!activeToken) {
      throw new UnauthorizedException();
    }

    await this.prisma.usersRefreshTokens.delete({ where: { id: activeToken.id }});
    return await this.signTokens(userId, email);
  }

  async deleteRefreshToken(userId: UserId, refreshToken: string) {
    const tokenHash = md5(refreshToken);
    await this.prisma.usersRefreshTokens.deleteMany({ where: { userId, tokenHash } });
  }

  async signTokens(userId: UserId, email: string) {
    const payload = {
      sub: userId,
      email
    };

    const [access_token, refresh_token] = await Promise.all([
      this.jwt.signAsync(payload, {
        expiresIn: '20m',
        secret: this.config.get('JWT_ACCESS_SECRET'),
      }),
      this.jwt.signAsync(payload, {
        expiresIn: '30d',
        secret: this.config.get('JWT_REFRESH_SECRET')
      })
    ]);

    await this.prisma.usersRefreshTokens.create({
      data: { userId, tokenHash: md5(`Bearer ${refresh_token}`) }
    });
    return { access_token, refresh_token };
  }

  async userExists(email: string) {
    const existing = await this.prisma.user.findUnique({ where: { email }});
    return Boolean(existing);
  }
}
