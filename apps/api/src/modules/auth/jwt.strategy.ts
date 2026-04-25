import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { InjectRepository } from "@mikro-orm/nestjs";
import { EntityRepository } from "@mikro-orm/core";
import type { JwtUserPayload } from "@ffxiv-guide-engine/types";
import { UserEntity } from "../../entities/user.entity";

type SafeUser = Readonly<{ id: string; email: string; role: JwtUserPayload["role"] }>;

/**
 * Validates JWT access tokens and loads the current user.
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, "jwt") {
  public constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: EntityRepository<UserEntity>
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET ?? "dev-secret-change-me"
    });
  }

  public async validate(payload: JwtUserPayload): Promise<SafeUser> {
    const user = await this.userRepository.findOne({ id: payload.sub });
    if (!user) {
      throw new UnauthorizedException();
    }
    return { id: user.id, email: user.email, role: user.role };
  }
}
