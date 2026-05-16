import {
  INestApplication,
  Injectable,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { join } from 'node:path';
import { PrismaPg } from '@prisma/adapter-pg';
import type { PrismaClient as GeneratedAuthPrismaClient } from '../../generated/auth-prisma/client';

const { PrismaClient } = require(
  join(process.cwd(), 'src/generated/auth-prisma/client.js'),
) as { PrismaClient: typeof GeneratedAuthPrismaClient };

@Injectable()
export class AuthPrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    const connectionString =
      process.env.AUTH_DATABASE_URL ??
      process.env.DATABASE_URL ??
      'postgresql://postgres:postgres@localhost:5432/pesagigo_auth?schema=public';

    super({
      adapter: new PrismaPg({ connectionString }),
    });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  enableShutdownHooks(app: INestApplication) {
    (this as any).$on('beforeExit', async () => {
      await app.close();
    });
  }
}
