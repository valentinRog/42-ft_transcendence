import {
  Controller,
  Get,
  Post,
  UseGuards,
  Res,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginGuard } from './guard';
import { AuthDto, LogDto } from './dto';
import { GetUser } from './decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(LoginGuard)
  @Get('42login')
  async fortyTwoAuth() {
    // this will not be called, since the authentication is handled by Passport
    return;
  }

  @UseGuards(LoginGuard)
  @Get('42login/callback')
  async fortyTwoAuthCallback(@GetUser() user, @Res() response) {
    const prisma_user = await this.authService.findOrCreate(user);
    const token = await this.authService.signToken(
      prisma_user.id,
      prisma_user.login,
    );
    response.redirect(
      'http://localhost:5173/login' + '?token=' + token.access_token,
    );
  }

  @Post('signup')
  signup(@Body() dto: AuthDto) {
    return this.authService.signup(dto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('signin')
  signin(@Body() dto: LogDto) {
    return this.authService.signin(dto);
  }
}
