import { Body, Controller, Post } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";

/**
 * Authentication endpoints for clients and admin.
 */
@Controller("auth")
export class AuthController {
  public constructor(private readonly authService: AuthService) {}

  @Post("register")
  public async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post("login")
  public async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post("admin/test")
  public postAdminTest(): Readonly<{ ok: boolean }> {
    return { ok: true };
  }
}
