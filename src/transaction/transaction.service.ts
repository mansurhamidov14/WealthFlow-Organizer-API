import { Injectable, NotFoundException } from '@nestjs/common';
import { TransactionFormDto } from './transaction.dto';
import { PrismaService } from '@app/prisma/prisma.service';

@Injectable()
export class TransactionService {
  constructor(private db: PrismaService) {}

  getList(userId: string) {
    return this.db.transaction.findMany({ where: { userId }});
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
      return false;
    }
  }
}
