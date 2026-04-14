import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

<<<<<<< HEAD
@Global()
=======
@Global() // Giúp PrismaService có thể dùng ở mọi nơi mà không cần import PrismaModule lại
>>>>>>> 5e34437 (feat: integrate specialized brain-training backend and project handbook)
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
