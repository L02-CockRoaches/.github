import { Controller, Get, Post, Body, Query, UseGuards, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { MatchmakingService } from './matchmaking.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GetUser } from '../auth/get-user.decorator';

@ApiTags('matchmaking')
@Controller('matchmaking')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class MatchmakingController {
  constructor(private matchmakingService: MatchmakingService) {}

  @Post('join')
  @ApiOperation({ summary: 'Tham gia hàng chờ ghép cặp đấu đối kháng' })
  join(
    @GetUser() user: { id: number; name: string | null; email: string },
    @Body('gameId', ParseIntPipe) gameId: number
  ) {
    const name = user.name || user.email.split('@')[0];
    return this.matchmakingService.joinQueue(user.id, name, user.email, gameId);
  }

  @Get('status')
  @ApiOperation({ summary: 'Kiểm tra trạng thái ghép cặp hiện tại' })
  status(
    @GetUser() user: { id: number },
    @Query('gameId', ParseIntPipe) gameId: number,
    @Query('allowBot') allowBot?: string
  ) {
    const isBotAllowed = allowBot === 'true';
    return this.matchmakingService.getStatus(user.id, gameId, isBotAllowed);
  }

  @Post('leave')
  @ApiOperation({ summary: 'Rời khỏi hàng chờ ghép cặp' })
  leave(@GetUser() user: { id: number }) {
    const success = this.matchmakingService.leaveQueue(user.id);
    return { success };
  }

  @Post('room/create')
  @ApiOperation({ summary: 'Tạo phòng chơi đối kháng (phòng tự do hoặc phòng riêng tư có mã)' })
  createRoom(
    @GetUser() user: { id: number; name: string | null; email: string },
    @Body('gameId', ParseIntPipe) gameId: number,
    @Body('isPrivate') isPrivate: boolean
  ) {
    const name = user.name || user.email.split('@')[0];
    return this.matchmakingService.createRoom(user.id, name, user.email, gameId, isPrivate);
  }

  @Get('rooms')
  @ApiOperation({ summary: 'Lấy danh sách các phòng tự do công khai đang chờ' })
  getPublicRooms() {
    return this.matchmakingService.getPublicRooms();
  }

  @Post('room/join')
  @ApiOperation({ summary: 'Tham gia phòng chơi' })
  joinRoom(
    @GetUser() user: { id: number; name: string | null; email: string },
    @Body('roomId') roomId: string
  ) {
    const name = user.name || user.email.split('@')[0];
    return this.matchmakingService.joinRoom(user.id, name, user.email, roomId);
  }

  @Get('room/status')
  @ApiOperation({ summary: 'Kiểm tra trạng thái phòng chơi' })
  getRoomStatus(@Query('roomId') roomId: string) {
    return this.matchmakingService.getRoomStatus(roomId);
  }

  @Post('room/leave')
  @ApiOperation({ summary: 'Rời/Hủy phòng chơi' })
  leaveRoom(
    @GetUser() user: { id: number },
    @Body('roomId') roomId: string
  ) {
    const success = this.matchmakingService.leaveRoom(roomId, user.id);
    return { success };
  }
}
