import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';
import { Expose } from 'class-transformer';

export class SignInReq {
  @Expose({ name: 'login_id' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(64)
  loginId!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(4)
  @MaxLength(128)
  password!: string;
}
