import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { HealthModule } from './health/health.module';
import { GamesModule } from './games/games.module';
import { ScoresModule } from './scores/scores.module';

@Module({
  imports: [
<<<<<<< HEAD
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    UsersModule,
    GamesModule,
    ScoresModule,
=======
    // 1. Quản lý cấu hình .env
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    
    // 2. Cơ sở dữ liệu & Auth
    PrismaModule, 
    AuthModule,
    UsersModule,
    
    // 3. Nghiệp vụ trò chơi Brain Training
    GamesModule,
    ScoresModule,

    // 4. Monitoring & Health Checks
>>>>>>> 5e34437 (feat: integrate specialized brain-training backend and project handbook)
    HealthModule,
  ],
})
export class AppModule {}
