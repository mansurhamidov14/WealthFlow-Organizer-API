import { PrismaService } from '@app/prisma/prisma.service';
import { ForbiddenException, Injectable } from '@nestjs/common';
import { AccountFormDto } from './account.dto';

@Injectable()
export class AccountService {
  private static PRIMARY_ACCOUNT_CAN_NOT_BE_DELETED_ERROR = 'PrimaryAccountCanNotBeDeleted';

  constructor(private db: PrismaService) {}

  getList(userId: string) {
    return this.db.account.findMany({ where: { userId }});
  }

  findById(id: string, userId: string) {
    return this.db.account.findUnique({ where: { id, userId }});
  }

  async create(userId: string, dto: AccountFormDto) {
    const primary = dto.primary && dto.primary != '0';
    if (primary) {
      await this.removePrimaryFlagFromPrimaryAccount(userId);
    }
  
    return this.db.account.create({
      data: {
        ...dto,
        userId,
        primary,
        createdAt: new Date()
      }
    });
  }

  async update(id: string, userId: string, dto: AccountFormDto) {
    const primary = dto.primary && dto.primary != '0';
    if (primary) {
      await this.removePrimaryFlagFromPrimaryAccount(userId);
    }
    return this.db.account.update({
      where: { id, userId },
      data: {
        ...dto,
        primary, 
        updatedAt: new Date()
      }
    });
  }

  private removePrimaryFlagFromPrimaryAccount(userId: string) {
    return this.db.account.updateMany({
      where: { userId, primary: true },
      data: { primary: false }
    });
  }

  async delete(id: string, userId: string) {
    const isPrimary = await this.db.account.count({ where: { id, userId, primary: true }});
    if (isPrimary) {
      throw new ForbiddenException(AccountService.PRIMARY_ACCOUNT_CAN_NOT_BE_DELETED_ERROR);
    }

    return this.db.account.delete({ where: { userId, id }})
  }

  async changeBalance(id: string, userId: string, difference: number) {
    return this.db.account.update({
      where: { id, userId },
      data: {
        balance: { increment: difference }
      }
    });
  }
}
