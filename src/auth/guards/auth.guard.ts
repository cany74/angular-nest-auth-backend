import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from '../interfaces/jwt-payload';
import { AuthService } from '../auth.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private authService: AuthService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    // console.log(request);
    const token = this.extractTokenFromHeader(request);
    // console.log({token});
    // return Promise.resolve(true);

    if (!token) {
      throw new UnauthorizedException('TOKEN IS REQUIRED');
    }
    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(token, {
        secret: process.env.JWT_SEED,
      });
      // console.log({payload});
      const user = await this.authService.findUserById(payload.id);
      if (!user) throw new UnauthorizedException('UNRECOGNIZED USER');
      if (!user.isActive) throw new UnauthorizedException('USER IS NOT ACTIVE');
      request['user'] = user;
    } catch {
      throw new UnauthorizedException('INVALID ACCESS TOKEN');
    }
    return Promise.resolve(true);
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers['authorization']?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
