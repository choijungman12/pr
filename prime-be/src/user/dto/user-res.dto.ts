import { SocialProvider } from "src/auth/interface/auth.interface";

export type UserInfo = {
  userName: string | null;
  userEmail: string | null;
};

export class SignUpRes {
  status: string;
  message: string;
  data: UserInfo | null;

  constructor(status: string = 'fail', message: string = '회원가입 실패', data: UserInfo | null,) {
    this.status = status;
    this.message = message;
    if (data) this.data = data;
  }

  static of(data: UserInfo) {
    const result = new SignUpRes('success', '회원가입 완료.', data);
    return result;
  }
}

export class GetUserInfoRes {
  status: 'success' | 'fail';
  message: string;
  data: UserInfo | null;

  private constructor(
    status: 'success' | 'fail',
    message: string,
    data: UserInfo | null,
  ) {
    this.status = status;
    this.message = message;
    this.data = data;
  }

  static of(data: UserInfo) {
    return new GetUserInfoRes('success', '사용자 정보 조회 완료', data);
  }
}


export class SocialLinkRes {
  status: 'success';
  message: string;
  socialProvider: SocialProvider;
  authorizeUrl: string;

  private constructor(
    status: 'success',
    message: string,
    socialProvider: SocialProvider,
    authorizeUrl: string,
  ) {
    this.status = status;
    this.message = message;
    this.socialProvider = socialProvider;
    this.authorizeUrl = authorizeUrl;
  }

  static of(provider: SocialProvider, authorizeUrl: string) {
    return new SocialLinkRes('success', '소셜 연동을 시작합니다.', provider, authorizeUrl);
  }
}