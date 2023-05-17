import { Module } from '@nestjs/common';
import { PongGateway } from './gateway';

@Module({
  providers: [PongGateway],
})
export class GatewayModule {}
