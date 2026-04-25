import { Module } from "@nestjs/common";
import { MikroOrmModule } from "@mikro-orm/nestjs";
import { UserEntity } from "../../entities/user.entity";

@Module({
  imports: [MikroOrmModule.forFeature([UserEntity])],
  exports: [MikroOrmModule]
})
export class UsersModule {}
