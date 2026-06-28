import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { SsoLoginDto } from './dto/sso-login.dto';

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
    };
  }

  async validateJwtPayload(payload: { sub: string; email: string; role: string }) {
    return this.usersService.findById(payload.sub);
  }
}
