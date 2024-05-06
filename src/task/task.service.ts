import { PrismaService } from '@app/prisma/prisma.service';
import { Injectable, NotFoundException } from '@nestjs/common';
import { OneTimeTaskResponse, RecurringTaskResponse, TaskFormDto } from './task.dto';
import { Task, User } from '@prisma/client';

@Injectable()
export class TaskService {
  constructor(private db: PrismaService) {}

  getList(userId: User['id']) {
    return this.db.task.findMany({ where: { userId } });
  }

  async addTask(userId: User['id'], dto: TaskFormDto) {
    const isRecurring = Boolean(Number(dto.isRecurring));

    // Creating single record if task is not recurring
    if (!isRecurring) {
      return this.db.task.create({
        data: {
          userId,
          weekday: new Date(dto.startDate).getDay() || 7,
          title: dto.title,
          startDate: dto.startDate,
          endDate: dto.endDate,
          isRecurring,
          time: dto.time,
          createdAt: new Date(),
        }
      });
    }

    const [originalTaskDay, ...restDays] = dto.days;
    const originalTask = await this.db.task.create({
      data: {
        userId,
        weekday: originalTaskDay.day,
        startDate: dto.startDate,
        endDate: dto.endDate,
        title: dto.title,
        time: originalTaskDay.time,
        doneAt: originalTaskDay.doneAt && new Date(originalTaskDay.doneAt),
        isRecurring,
        createdAt: new Date()
      }
    });

    if (restDays.length) { // Linking rest days records to the original task
      await this.db.task.createMany({
        data: restDays.map((taskDay) => ({
          userId,
          originalId: originalTask.id,
          weekday: taskDay.day,
          startDate: dto.startDate,
          endDate: dto.endDate,
          title: dto.title,
          time: taskDay.time,
          doneAt: taskDay.doneAt && new Date(taskDay.doneAt),
          isRecurring,
          createdAt: new Date()
        }))
      });
    }

    return originalTask;
  }
  
  async delete(
    originalId: Task['id'],
    userId: User['id'],
    hardDelete: boolean
  ) {
    if (hardDelete) { // We should delete original task with all linked tasks
      return this.db.task.deleteMany({
        where: {
          OR: [
            { id: originalId, userId: userId },
            { originalId, userId }
          ]
        }
      });
    }

    // Deleting only the task with specific ID
    const deleted = await this.db.task.delete({ where: { userId, id: originalId } });
    
    // Exiting if deleted task is not original task which can have linked tasks
    if (!deleted && !deleted.isRecurring || deleted.originalId) {
      return deleted;
    }

    // Finding linked tasks IDs
    const linkedTaskIds = (await this.db.task.findMany({
      select: { id: true },
      where: { originalId },
      orderBy: { weekday: 'asc' }
    }))
      .map(({ id }) => id);

    const [newOriginalTask, ...updatedTasks] = linkedTaskIds;

    // Exiting if there is no linked tasks
    if (!newOriginalTask) {
      return deleted;
    }

    // Setting first occurrence as a new original tasks
    await this.db.task.update({
      data: {
        originalId: null
      },
      where: { id: newOriginalTask }
    });

  
    if (updatedTasks.length) { // Linking rest tasks to the new original task if they exist
      await this.db.task.updateMany({
        data: { originalId: newOriginalTask },
        where: { id: { in: updatedTasks } }
      });
    }

    return deleted;
  }

  async getById(id: Task['id'], userId: User['id']) {
    const task = await this.db.task.findUnique({ where: { id, userId } });

    if (!task) {
      throw new NotFoundException('Task not found');
    };

    if (!task.isRecurring) {
      return {
        id: task.id,
        title: task.title,
        time: task.time,
        userId: task.userId,
        date: task.startDate,
        isRecurring: 0
      } as OneTimeTaskResponse;
    };

    const linkedTasks = await this.db.task.findMany({
      where: task.originalId
        ? {
          OR: [
            { originalId: task.originalId },
            { id: task.originalId }
          ]
        }
        : { originalId: task.id },
      orderBy: { weekday: 'asc' }
    });

    return {
      id: task.originalId ?? task.id,
      title: task.title,
      userId: task.userId,
      isRecurring: 1,
      startDate: task.startDate,
      endDate: task.endDate,
      days: linkedTasks.map(linked => ({
        day: linked.weekday,
        time: linked.time,
        doneAt: linked.doneAt?.getTime()
      }))
    } as RecurringTaskResponse;
  }

  updateById(id: Task['id'], userId: User['id'], data: Partial<Task>) {
    return this.db.task.update({
      where: { id, userId },
      data
    });
  }
}
