import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { TicketsService } from './tickets.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { GlobalRole } from '@prisma/client';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';

@ApiTags('Tickets')
@Controller('tickets')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get()
  @ApiOperation({ summary: 'Mendapatkan semua tiket (khusus ADMIN)' })
  getAllTickets(@CurrentUser('globalRole') role: GlobalRole) {
    if (role !== GlobalRole.SUPER_ADMIN && role !== GlobalRole.OPERATIONS_CS) {
      throw new ForbiddenException('Akses ditolak');
    }
    return this.ticketsService.getAllTickets();
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post()
  @ApiOperation({ summary: 'Buat tiket baru' })
  createTicket(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateTicketDto,
  ) {
    return this.ticketsService.createTicket(userId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Patch(':id')
  @ApiOperation({ summary: 'Update tiket (khusus ADMIN)' })
  updateTicket(
    @CurrentUser('globalRole') role: GlobalRole,
    @Param('id') id: string,
    @Body() dto: UpdateTicketDto,
  ) {
    if (role !== GlobalRole.SUPER_ADMIN && role !== GlobalRole.OPERATIONS_CS) {
      throw new ForbiddenException('Akses ditolak');
    }
    return this.ticketsService.updateTicket(id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Delete(':id')
  @ApiOperation({ summary: 'Hapus tiket (khusus ADMIN)' })
  deleteTicket(
    @CurrentUser('globalRole') role: GlobalRole,
    @Param('id') id: string,
  ) {
    if (role !== GlobalRole.SUPER_ADMIN && role !== GlobalRole.OPERATIONS_CS) {
      throw new ForbiddenException('Akses ditolak');
    }
    return this.ticketsService.deleteTicket(id);
  }
}
