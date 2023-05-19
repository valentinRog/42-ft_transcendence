import { Module } from '@nestjs/common';
import { PongGateway } from './pong.gateway';

@Module({
  //import: [],
  providers: [PongGateway],
})
export class PongModule {}
