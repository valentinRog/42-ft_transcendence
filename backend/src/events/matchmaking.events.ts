// matchmaking.events.ts
import { PlayerDto } from './player.dto';

export class PlayerJoinedQueueEvent {
  constructor(public readonly player: PlayerDto) {}
}

export class MatchFoundEvent {
  constructor(public readonly players: PlayerDto[]) {}
}

export class PlayerLeftQueueEvent {
  constructor(public readonly player: PlayerDto) {}
}
