import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
<<<<<<< HEAD
import { HealthController } from './health.controller';

@Module({
  imports: [TerminusModule],
=======
import { HttpModule } from '@nestjs/axios';
import { HealthController } from './health.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [TerminusModule, HttpModule, PrismaModule],
>>>>>>> 5e34437 (feat: integrate specialized brain-training backend and project handbook)
  controllers: [HealthController],
})
export class HealthModule {}
