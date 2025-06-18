import { Controller, Post, UseGuards, Request, Get, Body, HttpCode, HttpStatus, Logger } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { LocalAuthGuard } from '../guards/local-auth.guard';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { LoginDto } from '../dto/login.dto';
import { CreateUserDto } from '../../users/dto/create-user.dto';
import { UsersService } from '../../users/services/users.service';
import { User as UserModel } from '@prisma/client';

interface AuthenticatedRequest extends Request {
  user: Omit<UserModel, 'password'> | { userId: string; email: string };
}

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Request() req: AuthenticatedRequest, @Body() loginDto: LoginDto /* loginDto for validation */) {
    this.logger.log(`Requisição de login recebida para: ${loginDto.email}`);
    const userPayload = req.user as Omit<UserModel, 'password'>;
    return this.authService.login(userPayload);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req: AuthenticatedRequest) {
    this.logger.log(`Requisição de perfil recebida para o usuário: ${(req.user as any)?.email}`);
    return req.user;
  }

  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    this.logger.log(`Tentativa de registro para o email: ${createUserDto.email}`);
    const user = await this.usersService.create(createUserDto);
    this.logger.log(`Usuário registrado com sucesso: ${user.email}`);
    // Optional: Log in user immediately and return token
    // const userPayload = { id: user.id, email: user.email };
    // return this.authService.login(userPayload);
    return user; // Returns created user (without password)
  }
}
