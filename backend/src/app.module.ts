import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { HealthModule } from './health/health.module';
import { GamesModule } from './games/games.module';
import { ScoresModule } from './scores/scores.module';
import { SentryModule } from '@sentry/nestjs/setup';
import { MatchmakingModule } from './matchmaking/matchmaking.module';
import { MetricsModule } from './metrics/metrics.module';

@Module({
  imports: [
    SentryModule.forRoot(),
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    UsersModule,
    GamesModule,
    ScoresModule,
    HealthModule,
    MatchmakingModule,
    MetricsModule,
  ],
})
export class AppModule {}
