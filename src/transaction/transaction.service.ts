import { AccountId } from '@app/account/account.dto';
import { PrismaService } from '@app/prisma/prisma.service';
import { UserId } from '@app/user/user.dto';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { QueryFilter, TransactionFormDto, TransactionId } from './transaction.dto';

@Injectable()
export class TransactionService {
  constructor(private db: PrismaService) {}

  getList(userId: UserId, filter: QueryFilter) {
    console.log(filter)
    const { fromDate, toDate, take, skip } = filter ?? {};
    return this.db.transaction.findMany({
      include: {
        account: {
          select: {
            id: true,
            currency: true
          }
        }
      },
      where: {
        userId,
        transactionDateTime: {
          gte: fromDate &&  new Date(fromDate),
          lte: toDate && new Date(toDate)
        },
      },
      orderBy: { transactionDateTime: 'desc' },
      skip,
      take
    });
  }

  findById(id: TransactionId, userId: UserId) {
    return this.db.transaction.findUnique({
      include: {
        account: {
          select: {
            id: true,
            currency: true
          }
        }
      },
      where: { id, userId }});
  }

  async create(userId: UserId, dto: TransactionFormDto) {
    const { date, account, ...rest } = dto;
    return this.db.transaction.create({
      data: {
        ...rest,
        user: { connect: { id: userId } },
        account: { connect: { id: Number(account) } },
        transactionDateTime: new Date(date),
        createdAt: new Date()
      }
    });
  }

  async update(id: TransactionId, userId: UserId, dto: TransactionFormDto) {
    const { date, account, ...rest } = dto;
    try {
      const updated = await this.db.transaction.update({
        where: { id, userId },
        data: {
          ...rest,
          account: { connect: { id: Number(account) } },
          transactionDateTime: new Date(date),
          updatedAt: new Date()
        }
      });
      return updated;
    } catch (e) {
      throw new NotFoundException('Transaction not found');
    }
  }

  async delete(id: TransactionId, userId: UserId) {
    try {
      await this.db.transaction.delete({ where: { userId, id }});
      return true;
    } catch (e) {
      throw new NotFoundException('Transaction not found')
    }
  }

  async deleteByAccountId(userId: UserId, accountId: AccountId) {
    try {
      const deleted = await this.db.transaction.deleteMany({ where: { accountId, userId } });
      return deleted;
    } catch (e) {
      throw new BadRequestException('Bad request')
    }
  }
}
