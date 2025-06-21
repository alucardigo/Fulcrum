import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { UsersModule } from '../users/users.module';
import { AuthService } from './services/auth.service';
import { AuthController } from './controllers/auth.controller';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
// PrismaService is not directly used by AuthModule/AuthService if UsersService handles DB interaction.
// import { PrismaService } from '../prisma.service';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: configService.get<string>('JWT_EXPIRES_IN') || '60m' }, // Added fallback for JWT_EXPIRES_IN
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    LocalStrategy,
    JwtStrategy,
    // PrismaService // Not needed here if UsersService (via UsersModule) uses it.
  ],
  exports: [AuthService],
})
export class AuthModule {}
