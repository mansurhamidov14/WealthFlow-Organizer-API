import { NumParam } from '@app/decorators/urlparams.decorator';
import { User } from '@app/decorators/user.decorator';
import { JwtAccessGuard } from '@app/guards/jwt-access/jwt-access.guard';
import { UserId } from '@app/user/user.dto';
import { Body, Controller, Delete, Get, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { TaskFormDto, ToggleDoneDto } from './task.dto';
import { TaskService } from './task.service';

@UseGuards(JwtAccessGuard)
@Controller('task')
export class TaskController {
  constructor(private taskService: TaskService) {}

  @Get('list')
  getTasks(@User('sub') userId: UserId) {
    return this.taskService.getList(userId);
  }

  @Post('new')
  addTask(@User('sub') userId: UserId, @Body() dto: TaskFormDto) {
    return this.taskService.addTask(userId, dto);
  }

  @Get(':id')
  getById(@User('sub') userId: UserId, @NumParam('id') id: number) {
    return this.taskService.getById(id, userId);
  }

  @Patch(':id')
  async updateTask(@User('sub') userId: UserId, @NumParam('id') id: number, @Body() dto: TaskFormDto) {
    await this.taskService.delete(id, userId, true);
    return this.taskService.addTask(userId, dto);
  }

  @Patch(':id/done')
  toggleDone(@User('sub') userId: UserId, @NumParam('id') id: number, @Body() dto: ToggleDoneDto) {
    return this.taskService.updateById(id, userId, {
      doneAt: dto.doneAt ? new Date(dto.doneAt) : null,
      updatedAt: new Date()
    });
  }

  @Delete(':id')
  deleteTask(
    @User('sub') userId: UserId,
    @NumParam('id') id: number,
    @Query('hard') deleteHard?: string
  ) {
    return this.taskService.delete(id, userId, deleteHard && !['0', 'false'].includes(deleteHard))
  }
}
