import { Controller, Get, Query, Res, Redirect} from '@nestjs/common';
import { Request, Response } from 'express';
import * as querystring from 'querystring';


@Controller('auth')
export class OAuthController {
  @Get()
  @Redirect(
    'https://api.intra.42.fr/oauth/authorize?' +
      querystring.stringify({
        client_id: 'u-s4t2ud-60ebefcb75374b0f7a7aa4c158df08058f4db7e73bd1a7c7feeb8fe041f9ae6d',
        redirect_uri: 'http://localhost:3000/auth/callback',
        response_type: 'code',
      }),
    301,
  )
  redirectToNest(): void {}

  @Get('callback')
  async callback(@Query('code') code: string, @Res() res: Response) {
    // Handle the callback from the 42 API and retrieve the `code` parameter
    console.log(`Received code: ${code}`);

    // You can then use the code to obtain an access token from the 42 API

    // Send a response to the client
    return res.send('Callback received!');
  }
}
