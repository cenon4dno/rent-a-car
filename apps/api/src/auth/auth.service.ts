import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UsersService } from '../users/users.service';
import { SsoLoginDto } from './dto/sso-login.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async ssoLogin(dto: SsoLoginDto) {
    const user = await this.usersService.upsertFromSso(dto);

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    return {
      accessToken: this.jwtService.sign(payload),
      userId: user.id,
      role: user.role,
      profileComplete: this.isProfileComplete(user),
    };
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const payload = { sub: user.id, email: user.email, role: user.role };
    return {
      accessToken: this.jwtService.sign(payload),
      userId: user.id,
      role: user.role,
      profileComplete: this.isProfileComplete(user),
    };
  }

  // Customers must have both sides of their driver's license on file before
  // the web app lets them into the booking flow
  private isProfileComplete(user: {
    role: string;
    customerProfile?: { licenseUrl: string | null; licenseBackUrl: string | null } | null;
  }) {
    if (user.role !== 'CUSTOMER') return true;
    return !!(user.customerProfile?.licenseUrl && user.customerProfile?.licenseBackUrl);
  }

  async validateJwtPayload(payload: { sub: string; email: string; role: string }) {
    return this.usersService.findById(payload.sub);
  }
}
