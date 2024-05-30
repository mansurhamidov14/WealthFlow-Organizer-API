import { PrismaService } from '@app/prisma/prisma.service';
import { UserId } from '@app/user/user.dto';
import { Injectable, NotFoundException } from '@nestjs/common';
import { Task } from '@prisma/client';
import { OneTimeTaskResponse, RecurringTaskResponse, TaskFormDto, TaskId } from './task.dto';

@Injectable()
export class TaskService {
  constructor(private db: PrismaService) {}

  getList(userId: UserId) {
    return this.db.task.findMany({ where: { userId } });
  }

  async addTask(userId: UserId, dto: TaskFormDto) {
    const isRecurring = Boolean(Number(dto.isRecurring));

    // Creating single record if task is not recurring
    if (!isRecurring) {
      return this.db.task.create({
        data: {
          userId,
          weekday: new Date(dto.startDate).getDay() || 7,
          title: dto.title,
          startDate: dto.startDate,
          endDate: isRecurring ? dto.endDate : dto.startDate,
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
        doneAt: new Date(originalTaskDay.doneAt ?? 0),
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
          doneAt: new Date(taskDay.doneAt ?? 0),
          isRecurring,
          createdAt: new Date()
        }))
      });
    }

    return originalTask;
  }
  
  async delete(
    originalId: TaskId,
    userId: UserId,
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

  async getById(id: TaskId, userId: UserId) {
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

    const searchId = task.originalId ?? task.id
    const linkedTasks = await this.db.task.findMany({
      where: {
        OR: [
          { originalId: searchId },
          { id: searchId }
        ]
      }
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

  updateById(id: TaskId, userId: UserId, data: Partial<Task>) {
    return this.db.task.update({
      where: { id, userId },
      data
    });
  }
}
