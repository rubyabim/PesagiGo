import { Module } from '@nestjs/common';
import { MountainsModule } from './mountains/mountains.module';
import { PrismaModule } from './prisma/prisma.module';
import { SessionsModule } from './sessions/sessions.module';
import { SeedModule } from './seed/seed.module';

@Module({
  imports: [PrismaModule, MountainsModule, SessionsModule, SeedModule],
})
export class AppModule {}