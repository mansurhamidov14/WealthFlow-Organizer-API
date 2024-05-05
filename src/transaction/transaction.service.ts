import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { QueryFilter, TransactionFormDto } from './transaction.dto';
import { PrismaService } from '@app/prisma/prisma.service';

@Injectable()
export class TransactionService {
  constructor(private db: PrismaService) {}

  getList(userId: string, filter: QueryFilter) {
    const { fromDate, toDate, category, take, skip } = filter ?? {};
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
        category: category || undefined
      },
      orderBy: { transactionDateTime: 'desc' },
      skip,
      take
    });
  }

  findById(id: string, userId: string) {
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

  async create(userId: string, dto: TransactionFormDto) {
    const { date, account, ...rest } = dto;
    return this.db.transaction.create({
      data: {
        ...rest,
        user: { connect: { id: userId } },
        account: { connect: { id: account } },
        transactionDateTime: new Date(date),
        createdAt: new Date()
      }
    });
  }

  async update(id: string, userId: string, dto: TransactionFormDto) {
    const { date, account, ...rest } = dto;
    try {
      const updated = await this.db.transaction.update({
        where: { id, userId },
        data: {
          ...rest,
          account: { connect: { id: account } },
          transactionDateTime: new Date(date),
          updatedAt: new Date()
        }
      });
      return updated;
    } catch (e) {
      throw new NotFoundException('Transaction not found');
    } 
  }

  async delete(id: string, userId: string) {
    try {
      await this.db.transaction.delete({ where: { userId, id }});
      return true;
    } catch (e) {
      throw new NotFoundException('Transaction not found')
    }
  }

  async deleteByAccountId(userId: string, accountId: string) {
    try {
      const deleted = await this.db.transaction.deleteMany({ where: { accountId, userId } });
      return deleted;
    } catch (e) {
      throw new BadRequestException('Bad request')
    }
  }
}
