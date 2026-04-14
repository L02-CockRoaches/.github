import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SecretsService {
  constructor(private configService: ConfigService) {}

  /**
   * Truy xuất cấu hình từ Environment Variables.
   * Trên Cloud (Render/AWS/Azure), các giá trị này được quản lý bởi Secrets Manager
   * thay vì lưu trực tiếp trong tệp .env ở môi trường Production.
   */
  getDatabaseUrl(): string {
    return this.configService.get<string>('DATABASE_URL') || '';
  }

  getJwtSecret(): string {
    return this.configService.get<string>('JWT_SECRET') || '';
  }
}
