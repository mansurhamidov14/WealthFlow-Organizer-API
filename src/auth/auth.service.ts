import { PrismaService } from '@app/prisma/prisma.service';
import { ForbiddenException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import * as argon from 'argon2';
import { AuthDto, SignUpDto } from './auth.dto';

@Injectable()
export class AuthService {
  static INCORRECT_PIN_MAX_ATTEMPTS = 3;
  static INCORRECT_PIN_TIMEOUT = BigInt(5 * 60 * 1000);
  static INCORRECT_PIN_EXCEPTION = 'IncorrectPinException';
  static INCORRECT_PIN_BLOCK_EXCEPTION = 'IncorrectPinBlockException';
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
      throw new ForbiddenException('Incorrect credentials');
    }

    // if user exists we verifty password
    const passwordMatches = await argon.verify(user.hash, dto.password);

    // throw an error if password is incorrect
    if (!passwordMatches) {
      throw new ForbiddenException('Incorrect credentials')
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
    const hash = await argon.hash(dto.password);

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
          createdAt: new Date().getTime()
        }
      });

      // return the saved user
      delete user.hash
      const access_token = await this.signToken(user.id, user.email);
      return { user, access_token };
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ForbiddenException('This email is already taken');
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

  async setPin(userId: User['id'], pinCode: string) {
    const pinHash = await argon.hash(pinCode);
    await this.prisma.user.update({ where: { id: userId}, data: { hasPinProtection: true, pinHash }});
    return true;
  }

  async validatePin(userId: User['id'], pinCode: string) {
    const where = { id: userId };
    const user = await this.prisma.user.findUnique({ where });
    const currentTime = BigInt(new Date().getTime());
    if (currentTime < user.blockTime + AuthService.INCORRECT_PIN_TIMEOUT) {
      throw new ForbiddenException(AuthService.INCORRECT_PIN_BLOCK_EXCEPTION);
    }
    const pinMatches = await argon.verify(user.pinHash, pinCode);
    const reachedMaxInvalidPinAttempts = user.incorrectPinAttemptsCounter >= AuthService.INCORRECT_PIN_MAX_ATTEMPTS - 1 && !pinMatches;
    const updateData: Partial<User> = {
      // Blocking user if he has entered invalid PIN and reached maximum attempts limit
      blockTime: reachedMaxInvalidPinAttempts ? currentTime : BigInt(0),
      // Increasing incorrect attempts counter if user has entered wrong PIN otherwise reseting counter 
      incorrectPinAttemptsCounter: pinMatches ? 0 : user.incorrectPinAttemptsCounter + 1
    }

    await this.prisma.user.update({ where, data: updateData });

    if (reachedMaxInvalidPinAttempts) {
      throw new ForbiddenException(AuthService.INCORRECT_PIN_BLOCK_EXCEPTION);
    }

    if (!pinMatches) {
      throw new ForbiddenException(AuthService.INCORRECT_PIN_EXCEPTION);
    }

    return true;
  }
}
