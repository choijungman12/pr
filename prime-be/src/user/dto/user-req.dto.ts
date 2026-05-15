import { IsEmail, IsIn, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { SocialProvider } from "src/auth/interface/auth.interface";

export class SignUpReq{
    @IsString()
    @IsNotEmpty()
    @IsEmail()
    email: string;
    @IsString()
    @IsNotEmpty()
    password:string;
    @IsString()
    @IsOptional()
    name?: string;
    @IsOptional()
    @IsIn(['male', 'female', 'other'])
    gender?: 'male' | 'female' | 'other';
    @IsString()
    @IsOptional()
    phone?:string;
}

export class SocialLinkReq {
    @IsIn(['naver', 'kakao', 'google', 'apple'])
    provider: SocialProvider;

    @IsOptional()
    @IsIn(['sem2em', 'prime'])
    client?: 'sem2em' | 'prime';
}