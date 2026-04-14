import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PrismaService } from '../prisma/prisma.service';

@ApiTags('games')
@Controller('games')
export class GamesController {
  constructor(private prisma: PrismaService) {}

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách các trò chơi luyện não' })
  findAll() {
    return this.prisma.game.findMany({
      select: { id: true, title: true, description: true }
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy thông tin chi tiết một trò chơi' })
  findOne(@Param('id') id: string) {
    return this.prisma.game.findUnique({
      where: { id: Number(id) },
    });
  }
}
