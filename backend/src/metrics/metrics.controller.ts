import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateMetricEventDto } from './dto/create-metric-event.dto';
import { MetricsService } from './metrics.service';

@ApiTags('metrics')
@Controller('metrics')
export class MetricsController {
  constructor(private readonly metricsService: MetricsService) {}

  @Post()
  @ApiOperation({ summary: 'Thu thập sự kiện engagement, retention và performance từ client' })
  record(@Body() createMetricEventDto: CreateMetricEventDto) {
    return this.metricsService.record(createMetricEventDto);
  }
}
