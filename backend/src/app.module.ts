import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { OAuthController } from './oauth.controller';

@Module({
  imports: [],
  controllers: [AppController, OAuthController],
  providers: [AppService],
})
export class AppModule {}
