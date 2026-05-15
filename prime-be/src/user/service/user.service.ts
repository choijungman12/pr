import { BadRequestException, ConflictException, forwardRef, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { UserRepository } from "../repository/user.repository";
import * as dtoReq from '../dto/user-req.dto'
import * as dtoRes from '../dto/user-res.dto'
import * as bcrypt from 'bcrypt';
import { Response } from "express";
import { JwtService } from "@nestjs/jwt";
import { AuthService } from "src/auth/service/auth.service";


@Injectable()
export class UserService{
    constructor(
        private readonly userRepository: UserRepository,
        private readonly jwtService: JwtService,
        @Inject(forwardRef(() => AuthService))
        private readonly authService: AuthService,
    ){}

    // 이메일 검증
    async checkEmail(email:string):Promise<boolean>{
        const userInfo = await this.userRepository.getUserByEmail(email)
        return userInfo.length > 0;
    }

    // 비밀번호 검증(차후 검증로직 추가+특수문자 등)_26.03.24
    async checkPassword(password:string):Promise<boolean>{
        return password.length >= 6;
    }

    // 회원가입
    async signUp(body:dtoReq.SignUpReq, res:Response):Promise<dtoRes.SignUpRes>{
        const emailCheck = await this.checkEmail(body.email);
        if(emailCheck){
            throw new ConflictException('이미 가입된 이메일입니다.');
        }

        const passwordCheck = await this.checkPassword(body.password);
        if (!passwordCheck) {
            throw new BadRequestException('비밀번호는 6자 이상이어야 합니다.');
        }

        const userName = body.name?.trim()
        const hashedPassword = await bcrypt.hash(body.password, 10);
        await this.userRepository.insertUserBySignUp({
            ...body,
            name: userName,
            password: hashedPassword,
        });

        const createdUser = (await this.userRepository.getUserByEmail(body.email))[0];
        if (!createdUser) {
            throw new NotFoundException('회원가입 사용자 조회에 실패했습니다.');
        }

        const actionTicket = this.jwtService.sign(
            {secureAction: true, loginId: String(createdUser.id)},
            {secret: process.env.JWT_TOKEN_SECRET_KEY,expiresIn: '6h'},
        );
        const userInfo = {
            userName: createdUser.name ?? null,
            userEmail: createdUser.email ?? null,
        };

        const cookieOption = {
            httpOnly: true,
            secure: true,
            sameSite: 'strict' as const,
            path: '/',
            maxAge: 6 * 60 * 60 * 1000,
        };

        res.cookie('action_asid', actionTicket, cookieOption);

        return dtoRes.SignUpRes.of(userInfo);
    }

    async getUser(loginId: string): Promise<dtoRes.GetUserInfoRes> {
        const userId = Number(loginId);
        if (!Number.isFinite(userId) || userId <= 0) {
            throw new NotFoundException('사용자를 찾을 수 없습니다.');
        }

        const userInfo = await this.userRepository.getUserById(userId);
        if (!userInfo?.length) {
            throw new NotFoundException('사용자를 찾을 수 없습니다.');
        }

        return dtoRes.GetUserInfoRes.of({
            userName: userInfo[0].name ?? null,
            userEmail: userInfo[0].email ?? null,
        });
    }
    async socialLink(loginId: string, body: dtoReq.SocialLinkReq): Promise<dtoRes.SocialLinkRes> {
        const authorizeUrl = this.authService.getSocialLinkAuthorizeUrl(loginId, body.provider, body.client);
        return dtoRes.SocialLinkRes.of(body.provider, authorizeUrl);
    }
}
