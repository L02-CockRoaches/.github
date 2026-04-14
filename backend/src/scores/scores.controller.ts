import { Controller, Get, Post, Body, UseGuards, Query, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ScoresService } from './scores.service';
import { CreateScoreDto } from './dto/create-score.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GetUser } from '../auth/get-user.decorator';
import { User } from '@prisma/client';

@ApiTags('scores')
@Controller('scores')
export class ScoresController {
  constructor(private scoresService: ScoresService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Lưu điểm số mới sau khi kết thúc lượt chơi' })
  create(@GetUser() user: User, @Body() createScoreDto: CreateScoreDto) {
    return this.scoresService.create(user.id, createScoreDto);
  }

  @Get('leaderboard')
  @ApiOperation({ summary: 'Lấy bảng xếp hạng top 10 của một trò chơi' })
  getLeaderboard(@Query('gameId', ParseIntPipe) gameId: number) {
    return this.scoresService.getLeaderboard(gameId);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Lấy danh sách điểm cao cá nhân của tôi' })
  getMyHighScores(@GetUser() user: User) {
    return this.scoresService.getMyHighScores(user.id);
  }
}
