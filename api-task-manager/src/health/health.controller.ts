import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import {
    HealthCheck,
    HealthCheckService,
    HttpHealthIndicator,
    MemoryHealthIndicator,
} from '@nestjs/terminus';

@ApiTags('Health')
@Controller('health')
export class HealthController {

    constructor(
        private health: HealthCheckService,
        private http: HttpHealthIndicator,
        private memory: MemoryHealthIndicator,
    ) {
    }

    @Get()
    @ApiOperation({ summary: 'Check application health' })
    @HealthCheck()
    check() {
        return this.health.check([
            () => this.memory.checkHeap('memory_heap', 150 * 1024 * 1024),
            () => this.memory.checkRSS('memory_rss', 300 * 1024 * 1024),
            () => this.http.pingCheck('nestjs-docs', 'https://docs.nestjs.com'),
        ]);
    }
}