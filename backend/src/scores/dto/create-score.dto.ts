import { IsNumber, IsNotEmpty, IsOptional, IsPositive, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateScoreDto {
  @ApiProperty({ example: 1250, description: 'Điểm số người chơi đạt được' })
  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  value: number;

  @ApiProperty({ example: 0.95, description: 'Độ chính xác (0-1)' })
  @IsNumber()
  @IsOptional()
  @Max(1)
  accuracy?: number;

  @ApiProperty({ example: 120, description: 'Thời gian chơi tính bằng giây' })
  @IsNumber()
  @IsOptional()
  timeSpent?: number;

  @ApiProperty({ example: 1, description: 'ID của trò chơi' })
  @IsNumber()
  @IsNotEmpty()
  gameId: number;
}
