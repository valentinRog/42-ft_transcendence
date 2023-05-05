import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { FortyTwoStrategy } from './auth.strategy';
import { TwoFactorController } from './2fa/2fa.controller';

@Module({
	controllers: [AuthController, TwoFactorController],
	providers: [AuthService, FortyTwoStrategy],
})
export class AuthModule {}
