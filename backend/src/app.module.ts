import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService, AuthService } from './app.service';
import { AuthController } from './auth.controller';

@Module({
  imports: [],
  controllers: [AppController, AuthController],
  providers: [AppService, AuthService],
})
export class AppModule {}
