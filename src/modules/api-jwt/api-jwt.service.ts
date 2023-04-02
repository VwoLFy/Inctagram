import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ApiConfigService } from '../api-config/api.config.service';
import { AccessTokenDataType, TokensType } from '../auth/application/types/types';
import { SessionDto } from '../sessions/application/dto/SessionDto';

@Injectable()
export class ApiJwtService {
  constructor(private jwtService: JwtService, private apiConfigService: ApiConfigService) {}

  async createJWT(userId: number, deviceId: number): Promise<TokensType> {
    const secretRT = this.apiConfigService.REFRESH_TOKEN_SECRET;
    const expiresInRT = this.apiConfigService.EXPIRED_REFRESH;

    const accessToken = this.jwtService.sign({ userId });
    const refreshToken = this.jwtService.sign({ userId, deviceId }, { secret: secretRT, expiresIn: expiresInRT });

    return { accessToken, refreshToken };
  }

  async getRefreshTokenData(refreshToken: string): Promise<SessionDto | null> {
    try {
      const secretRT = this.apiConfigService.REFRESH_TOKEN_SECRET;
      return this.jwtService.verify(refreshToken, { secret: secretRT }) as SessionDto;
    } catch (e) {
      return null;
    }
  }

  async getUserIdByAccessToken(accessToken: string): Promise<number | null> {
    try {
      const result = this.jwtService.verify(accessToken) as AccessTokenDataType;
      return result.userId;
    } catch (e) {
      return null;
    }
  }
}
