import { Controller, Get } from '@nestjs/common';
import { HealthCheck } from '@nestjs/terminus';
import { DatabaseService } from 'src/data/database.service';

@Controller('health')
export class HealthController {
  constructor(private readonly db: DatabaseService) {}
  @Get()
  @HealthCheck()
  async health() {
    const users = await this.db.user.findMany();

    if (!users) {
      return { status: `can't connect to db` };
    }

    return { status: 'ok' };
  }
}
