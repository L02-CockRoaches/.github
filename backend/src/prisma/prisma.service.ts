import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
<<<<<<< HEAD
=======
    // Kết nối Database ngay khi Module khởi động
>>>>>>> 5e34437 (feat: integrate specialized brain-training backend and project handbook)
    await this.$connect();
  }

  async onModuleDestroy() {
<<<<<<< HEAD
=======
    // Ngắt kết nối khi ứng dụng dừng lại
>>>>>>> 5e34437 (feat: integrate specialized brain-training backend and project handbook)
    await this.$disconnect();
  }
}
