import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';

@Injectable()
export class TicketsService {
  constructor(private readonly prisma: PrismaService) {}

  async getAllTickets() {
    return this.prisma.ticket.findMany({
      include: {
        user: { select: { fullName: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createTicket(userId: string, dto: CreateTicketDto) {
    return this.prisma.ticket.create({
      data: {
        userId,
        subject: dto.subject,
        description: dto.description,
      },
    });
  }

  async updateTicket(id: string, dto: UpdateTicketDto) {
    return this.prisma.ticket.update({
      where: { id },
      data: dto,
    });
  }

  async deleteTicket(id: string) {
    return this.prisma.ticket.delete({
      where: { id },
    });
  }
}
