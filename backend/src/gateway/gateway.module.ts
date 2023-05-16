import { Module } from '@nestjs/common';
import { GameGateway } from './gateway';

@Module({
  providers: [GameGateway],
})
export class GatewayModule {}
