import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { FortyTwoStrategy } from './42.strategy';

@Module({
	controllers: [AuthController],
	providers: [AuthService, FortyTwoStrategy],
})
export class AuthModule {}
