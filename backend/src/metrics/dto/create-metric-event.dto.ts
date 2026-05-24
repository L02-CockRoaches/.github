import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsISO8601, IsObject, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateMetricEventDto {
  @ApiProperty({ example: 'onboarding_cta_pressed', description: 'Tên sự kiện metrics' })
  @IsString()
  @MaxLength(120)
  event: string;

  @ApiProperty({ example: '2026-05-24T10:30:00.000Z', description: 'Thời điểm phát sinh sự kiện' })
  @IsISO8601()
  timestamp: string;

  @ApiPropertyOptional({ example: 'session_abc123', description: 'Mã phiên client ẩn danh' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  sessionId?: string;

  @ApiPropertyOptional({ example: '42', description: 'Mã người dùng nếu đã đăng nhập' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  userId?: string;

  @ApiPropertyOptional({ example: { screen: 'home', isReturningUser: true }, description: 'Dữ liệu ngữ cảnh bổ sung' })
  @IsOptional()
  @IsObject()
  properties?: Record<string, unknown>;
}
