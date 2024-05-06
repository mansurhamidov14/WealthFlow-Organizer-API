import { User } from '@app/decorators/user.decorator';
import { JwtAccessGuard } from '@app/guards/jwt-access/jwt-access.guard';
import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { TaskFormDto, ToggleDoneDto } from './task.dto';
import { TaskService } from './task.service';

@UseGuards(JwtAccessGuard)
@Controller('task')
export class TaskController {
  constructor(private taskService: TaskService) {}

  @Get('list')
  getTasks(@User('sub') userId: string) {
    return this.taskService.getList(userId);
  }

  @Post('new')
  addTask(@User('sub') userId: string, @Body() dto: TaskFormDto) {
    return this.taskService.addTask(userId, dto);
  }

  @Get(':id')
  getById(@User('sub') userId: string, @Param('id') id: string) {
    return this.taskService.getById(id, userId);
  }

  @Patch(':id')
  async updateTask(@User('sub') userId: string, @Param('id') id: string, @Body() dto: TaskFormDto) {
    await this.taskService.delete(id, userId, true);
    return this.taskService.addTask(userId, dto);
  }

  @Patch(':id/done')
  toggleDone(@User('sub') userId: string, @Param('id') id: string, @Body() dto: ToggleDoneDto) {
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
