import { AuthGuard } from '@nestjs/passport';

export class LoginGuard extends AuthGuard('login_guard') {
  constructor() {
    super();
  }
}
