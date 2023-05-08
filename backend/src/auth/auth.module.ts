import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { FortyTwoStrategy } from './auth.strategy';
import { TwoFactorController } from './2fa/2fa.controller';
import { JwtStrategy } from './jwt/jwt.strategy';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [JwtModule.register({})],
  controllers: [AuthController, TwoFactorController],
  providers: [AuthService, FortyTwoStrategy, JwtStrategy],
})
export class AuthModule {}
