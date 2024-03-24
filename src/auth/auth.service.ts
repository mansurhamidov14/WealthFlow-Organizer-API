import { PrismaService } from '@app/prisma/prisma.service';
import { ForbiddenException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { hash as createHash, verify as verifyPassword } from 'argon2';
import { AuthDto, SignUpDto } from './auth.dto';

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

    const access_token = await this.signToken(user.id, user.email);
    delete user.hash;

    return {
      user,
      access_token
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
      const access_token = await this.signToken(user.id, user.email);
      return { user, access_token };
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ForbiddenException(AuthService.EMAIL_ALREADY_TAKEN_ERROR);
      }

      throw error;
    }
  }

  signToken(userId: User['id'], email: string) {
    const payload = {
      sub: userId,
      email
    };

    return this.jwt.signAsync(payload, {
      expiresIn: '2h',
      secret: this.config.get('JWT_SECRET')
    });
  }

  async userExists(email: string) {
    const existing = await this.prisma.user.findUnique({ where: { email }});
    return Boolean(existing);
  }
}
