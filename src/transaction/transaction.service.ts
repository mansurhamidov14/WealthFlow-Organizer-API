import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { TransactionFormDto } from './transaction.dto';
import { PrismaService } from '@app/prisma/prisma.service';

@Injectable()
export class TransactionService {
  constructor(private db: PrismaService) {}

  getList(userId: string, fromDate?: string, toDate?: string, category?: string) {
    return this.db.transaction.findMany({
      where: {
        userId,
        transactionDateTime: {
          gte: fromDate &&  new Date(fromDate),
          lte: toDate && new Date(toDate)
        },
        category: category || undefined
      },
      orderBy: { transactionDateTime: 'desc' }
    });
  }

  findById(id: string, userId: string) {
    return this.db.transaction.findUnique({ where: { id, userId }});
  }

  async create(userId: string, dto: TransactionFormDto) {
    const { transactionDateTime, accountId, ...rest } = dto;
    return this.db.transaction.create({
      data: {
        ...rest,
        user: { connect: { id: userId } },
        account: { connect: { id: accountId } },
        transactionDateTime: new Date(transactionDateTime),
        createdAt: new Date()
      }
    });
  }

  async update(id: string, userId: string, dto: TransactionFormDto) {
    const { transactionDateTime, accountId, ...rest } = dto;
    try {
      const updated = await this.db.transaction.update({
        where: { id, userId },
        data: {
          ...rest,
          account: { connect: { id: accountId } },
          transactionDateTime: new Date(transactionDateTime),
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
