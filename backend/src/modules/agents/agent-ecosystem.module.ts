import { Module } from '@nestjs/common';
import { AgentEcosystemController } from './agent-ecosystem.controller';
import { AgentEcosystemService } from './agent-ecosystem.service';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [AgentEcosystemController],
  providers: [AgentEcosystemService],
  exports: [AgentEcosystemService],
})
export class AgentEcosystemModule {}

