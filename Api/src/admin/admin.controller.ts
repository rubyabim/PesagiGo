import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AdminService } from './admin.service';
import { CreateRouteDto } from './dto/create-route.dto';
import { UpdateRouteDto } from './dto/update-route.dto';
import { ManageQuotaDto } from './dto/manage-quota.dto';

@UseGuards(JwtAuthGuard)
@Controller('api/admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post('routes')
  createRoute(@Body() dto: CreateRouteDto) {
    return this.adminService.createRoute(dto);
  }

  @Get('routes')
  listRoutes() {
    return this.adminService.listRoutes();
  }

  @Put('routes/:id')
  updateRoute(@Param('id') id: string, @Body() dto: UpdateRouteDto) {
    return this.adminService.updateRoute(id, dto);
  }

  @Delete('routes/:id')
  deleteRoute(@Param('id') id: string) {
    return this.adminService.deleteRoute(id);
  }

  @Post('quotas')
  manageQuota(@Body() dto: ManageQuotaDto) {
    return this.adminService.manageQuota(dto);
  }

  @Get('sessions')
  listSessions() {
    return this.adminService.listSessions();
  }

  @Get('bookings/stats')
  bookingStats() {
    return this.adminService.getBookingStats();
  }

  @Get('payments/stats')
  paymentStats() {
    return this.adminService.getPaymentStats();
  }
}
