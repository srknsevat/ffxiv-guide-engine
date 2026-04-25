import { ConflictException, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { InjectRepository } from "@mikro-orm/nestjs";
import { EntityRepository } from "@mikro-orm/core";
import * as bcrypt from "bcrypt";
import { randomUUID } from "node:crypto";
import type { JwtUserPayload } from "@ffxiv-guide-engine/types";
import { UserEntity } from "../../entities/user.entity";
import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";

export type AuthTokens = Readonly<{
  accessToken: string;
}>;

/**
 * Handles registration, login, and JWT issuance.
 */
@Injectable()
export class AuthService {
  public constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: EntityRepository<UserEntity>,
    private readonly jwtService: JwtService
  ) {}

  public async register(dto: RegisterDto): Promise<AuthTokens> {
    const existing = await this.userRepository.findOne({ email: dto.email });
    if (existing) {
      throw new ConflictException("Email already registered.");
    }
    const passwordHash = await bcrypt.hash(dto.password, 12);
    const entityManager = this.userRepository.getEntityManager();
    const user = entityManager.create(UserEntity, {
      id: randomUUID(),
      email: dto.email,
      passwordHash,
      role: "user",
      createdAt: new Date()
    });
    await entityManager.persistAndFlush(user);
    return { accessToken: this.signAccessToken(user) };
  }

  public async login(dto: LoginDto): Promise<AuthTokens> {
    const user = await this.userRepository.findOne({ email: dto.email });
    if (!user) {
      throw new UnauthorizedException("Invalid credentials.");
    }
    const isMatch = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedException("Invalid credentials.");
    }
    return { accessToken: this.signAccessToken(user) };
  }

  private signAccessToken(user: UserEntity): string {
    const payload: JwtUserPayload = {
      sub: user.id,
      email: user.email,
      role: user.role
    };
    return this.jwtService.sign({ ...payload });
  }
}
