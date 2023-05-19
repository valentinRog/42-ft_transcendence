import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { MatchmakingService } from './../matchmaking/matchmaking.service';
import {
  PlayerJoinedQueueEvent,
  MatchFoundEvent,
  PlayerLeftQueueEvent,
} from './matchmaking.events';

@Injectable()
export class MatchmakingEventListener {
  constructor(private readonly matchmakingService: MatchmakingService) {}

  @OnEvent('playerJoinedQueue')
  handlePlayerJoinedQueue(event: PlayerJoinedQueueEvent) {
    this.matchmakingService.handlePlayerJoinedQueue(event.player);
  }

  @OnEvent('matchFound')
  handleMatchFound(event: MatchFoundEvent) {
    this.matchmakingService.handleMatchFound(event.players);
  }

  @OnEvent('playerLeftQueue')
  handlePlayerLeftQueue(event: PlayerLeftQueueEvent) {
    this.matchmakingService.handlePlayerLeftQueue(event.player);
  }
}
