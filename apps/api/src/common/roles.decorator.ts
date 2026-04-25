import { SetMetadata } from "@nestjs/common";
import type { UserRole } from "@ffxiv-guide-engine/types";

export const Roles = (...roles: UserRole[]) => SetMetadata("roles", roles);
