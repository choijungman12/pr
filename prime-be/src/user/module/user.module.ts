import { Module, forwardRef } from '@nestjs/common';
import { DrizzleModule } from 'src/drizzle/drizzle.module';
import { UserRepository } from '../repository/user.repository';
import { UserController } from '../controller/user.controller';
import { UserService } from '../service/user.service';
import { AuthModule } from 'src/auth/module/auth.module';

@Module({
  imports: [DrizzleModule, forwardRef(() => AuthModule)],
  controllers: [UserController],
  providers: [UserService, UserRepository],
  exports: [UserRepository],
})
export class UserModule {}
