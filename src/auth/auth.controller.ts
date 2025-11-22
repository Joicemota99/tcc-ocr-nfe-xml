import { Controller, Post, UseGuards, Request, Res } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { Response } from 'express';

@Controller('auth')
export class AuthController {

  constructor(private authService: AuthService) {}

  // Rota: POST /auth/login
  @UseGuards(AuthGuard('local')) 
  @Post('login')
  async login(@Request() req, @Res() res: Response) {
    try {
      const result = await this.authService.login(req.user);

      return res.status(200).json(result);
    } catch (error) {

      console.error('Erro no login:', error);
      return res.status(401).json({
        message: 'Erro durante o login',
        error: error.message,
      });
    }
  }
}
