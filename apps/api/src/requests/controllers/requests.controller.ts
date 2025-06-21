import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { RequestsService } from '../services/requests.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard'; // Assumes JwtAuthGuard is in this location

@Controller('purchase-requests')
export class RequestsController {
  constructor(private readonly requestsService: RequestsService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll() {
    return this.requestsService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.requestsService.findOne(id);
  }
}
