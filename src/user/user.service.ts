import { PrismaService } from '@app/prisma/prisma.service';
import { ForbiddenException, Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { hash as createHash, verify as verifyPassword } from 'argon2';
import { ResetPasswordDto, SetPinDto, UserId } from './user.dto';

@Injectable()
export class UserService {
  private static INCORRECT_PIN_MAX_ATTEMPTS = 3;
  private static INCORRECT_PIN_TIMEOUT = 5 * 60 * 1000;
  private static INCORRECT_PIN_ERROR = 'IncorrectPin';
  private static INCORRECT_PIN_BLOCK_ERROR = 'IncorrectPinBlock';
  private static INVALID_PASSWORD_ERROR = 'InvalidPassword';

  constructor(private db: PrismaService) {}

  async getById(id: UserId) {
    const user = await this.db.user.findUnique({ where: { id }});
    if (user) {
      delete user.hash;
      delete user.pinHash;
    }
    return user;
  }

  async update(id: UserId, data: Partial<User>) {
    data.updatedAt = new Date();
    await this.db.user.update({ where: { id }, data });
  }

  async setPin(userId: UserId, dto: SetPinDto) {
    try {
      await this.validatePin(userId, dto.pinCode, false);
      const hasPinProtection = Boolean(dto.newPinCode);
      const pinHash = hasPinProtection ? await createHash(dto.newPinCode) : null;
      await this.db.user.update({
        where: { id: userId},
        data: { hasPinProtection, pinHash, updatedAt: new Date() }
      });
      return true;
    } catch (e) {
      throw e;
    }
  }

  async validatePin(userId: UserId, pinCode: string, applyLimits: boolean) {
    const where = { id: userId };
    const user = await this.db.user.findUnique({ where });
    if (!user.hasPinProtection) {
      return true;
    }

    const currentTime = new Date();
    if (user.blockTime && currentTime.getTime() < user.blockTime.getTime() + UserService.INCORRECT_PIN_TIMEOUT) {
      throw new ForbiddenException(UserService.INCORRECT_PIN_BLOCK_ERROR);
    }
    const pinMatches = await verifyPassword(user.pinHash, pinCode);
    const reachedMaxInvalidPinAttempts = applyLimits && user.incorrectPinAttemptsCounter >= UserService.INCORRECT_PIN_MAX_ATTEMPTS - 1 && !pinMatches;

    if (applyLimits) {
      const updateData: Partial<User> = {
        // Blocking user if he has entered invalid PIN and reached maximum attempts limit
        blockTime: reachedMaxInvalidPinAttempts ? currentTime : null,
        // Increasing incorrect attempts counter if user has entered wrong PIN otherwise reseting counter 
        incorrectPinAttemptsCounter: pinMatches ? 0 : user.incorrectPinAttemptsCounter + 1
      }
  
      await this.db.user.update({ where, data: updateData });
    }

    if (reachedMaxInvalidPinAttempts) {
      throw new ForbiddenException(UserService.INCORRECT_PIN_BLOCK_ERROR);
    }

    if (!pinMatches) {
      throw new ForbiddenException(UserService.INCORRECT_PIN_ERROR);
    }

    return true;
  }

  async removePinByPassword(userId: UserId, password: string) {
    try {
      const where = { id: userId };
      const user = await this.db.user.findUnique({ where });
      const passwordMatches = await verifyPassword(user.hash, password);

      if (!passwordMatches) {
        throw new ForbiddenException(UserService.INVALID_PASSWORD_ERROR);
      }

      await this.db.user.update({
        where,
        data: {
          pinHash: null,
          hasPinProtection: false,
          updatedAt: new Date()
        }
      });
      return true;
    } catch (e) {
      throw e;
    }
  }

  async updatePassword(userId: UserId, dto: ResetPasswordDto) {
    const where = { id: userId };
    try {
      const user = await this.db.user.findUnique({ where });
      const isPasswordValid = await verifyPassword(user.hash, dto.password);
      if (isPasswordValid) {
        const hash = await createHash(dto.newPassword);
        await this.db.user.update({ where, data: { hash, updatedAt: new Date() }});
        return true;
      }

      throw new ForbiddenException(UserService.INVALID_PASSWORD_ERROR)
    } catch (e) {
      throw e;
    }
  }
}
