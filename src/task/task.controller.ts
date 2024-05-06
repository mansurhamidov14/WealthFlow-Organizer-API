import { User } from '@app/decorators/user.decorator';
import { Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { TaskFormDto, ToggleDoneDto } from './task.dto';
import { TaskService } from './task.service';

@Controller('task')
export class TaskController {
  constructor(private taskService: TaskService) {}

  @Get('list')
  getTasks(@User('sub') userId: string) {
    return this.taskService.getList(userId);
  }

  @Post('new')
  addTask(@User('sub') userId: string, dto: TaskFormDto) {
    return this.taskService.addTask(userId, dto);
  }

  @Get(':id')
  getById(@User('sub') userId: string, @Param('id') id: string) {
    return this.taskService.getById(id, userId);
  }

  @Patch(':id')
  async updateTask(@User('sub') userId: string, @Param('id') id: string, dto: TaskFormDto) {
    await this.taskService.delete(id, userId, true);
    return this.taskService.addTask(userId, dto);
  }

  @Patch(':id/done')
  toggleDone(@User('sub') userId: string, @Param('id') id: string, dto: ToggleDoneDto) {
    return this.taskService.updateById(id, userId, {
      doneAt: dto.doneAt ? new Date(dto.doneAt) : null
    });
  }

  @Delete(':id')
  deleteTask(
    @User('sub') userId: string,
    @Param('id') id: string,
    @Query('hard') deleteHard?: string
  ) {
    return this.taskService.delete(id, userId, deleteHard && !['0', 'false'].includes(deleteHard))
  }
}
