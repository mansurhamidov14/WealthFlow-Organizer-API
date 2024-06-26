import { PrismaService } from '@app/prisma/prisma.service';
import { UserId } from '@app/user/user.dto';
import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { AccountFormDto, AccountId } from './account.dto';

@Injectable()
export class AccountService {
  private static PRIMARY_ACCOUNT_CAN_NOT_BE_DELETED_ERROR = 'PrimaryAccountCanNotBeDeleted';

  constructor(private db: PrismaService) {}

  getList(userId: UserId) {
    return this.db.account.findMany({ where: { userId }, orderBy: { primary: 'desc' } });
  }

  findById(id: AccountId, userId: UserId) {
    return this.db.account.findUnique({ where: { id, userId }});
  }

  async create(userId: UserId, dto: AccountFormDto) {
    const primary = dto.primary && dto.primary != '0';
    if (primary) {
      await this.removePrimaryFlagFromPrimaryAccount(userId);
    }
  
    return this.db.account.create({
      data: {
        ...dto,
        user: { connect: { id: userId }},
        primary,
        createdAt: new Date()
      }
    });
  }

  async update(id: AccountId, userId: UserId, dto: AccountFormDto) {
    const primary = dto.primary && dto.primary != '0';
    if (primary) {
      await this.removePrimaryFlagFromPrimaryAccount(userId);
    }

    try {
      const updated = this.db.account.update({
        where: { id, userId },
        data: {
          ...dto,
          primary, 
          updatedAt: new Date()
        }
      });
      return updated;
    } catch (e) {
      throw new NotFoundException('Account not found');
    }
  }

  private removePrimaryFlagFromPrimaryAccount(userId: UserId) {
    return this.db.account.updateMany({
      where: { userId, primary: true },
      data: { primary: false }
    });
  }

  async delete(id: AccountId, userId: UserId) {
    const isPrimary = await this.db.account.count({ where: { id, userId, primary: true }});
    if (isPrimary) {
      throw new ForbiddenException(AccountService.PRIMARY_ACCOUNT_CAN_NOT_BE_DELETED_ERROR);
    }
    try {
      const deleted = await this.db.account.delete({ where: { userId, id }});
      return deleted;
    } catch (e) {
      throw new NotFoundException('Account not found');
    }
  }

  async changeBalance(id: AccountId, userId: UserId, difference: number) {
    try {
      const updated = this.db.account.update({
        where: { id, userId },
        data: {
          balance: { increment: difference }
        }
      });
      return updated;
    } catch (e) {
      throw new NotFoundException('Account not found');
    }
  }
}
