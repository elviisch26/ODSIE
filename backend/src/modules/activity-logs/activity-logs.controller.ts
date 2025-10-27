import { Controller, Get, Param, UseGuards, Query } from '@nestjs/common';
import { ActivityLogsService } from './activity-logs.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles, GetUser } from '../auth/decorators';
import { UserRole } from '../../common/enums';

@Controller('activity-logs')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ActivityLogsController {
  constructor(private readonly activityLogsService: ActivityLogsService) {}

  @Get()
  @Roles(UserRole.ADMINISTRADOR)
  findAll(@Query('limit') limit?: number) {
    return this.activityLogsService.findAll(limit ? parseInt(limit.toString()) : 100);
  }

  @Get('statistics')
  @Roles(UserRole.ADMINISTRADOR)
  getStatistics() {
    return this.activityLogsService.getStatistics();
  }

  @Get('me')
  findMyLogs(@GetUser() user: any) {
    return this.activityLogsService.findByUser(user.id);
  }

  @Get('patient/:patientId')
  findByPatient(@Param('patientId') patientId: string) {
    return this.activityLogsService.findByPatient(patientId);
  }
}
