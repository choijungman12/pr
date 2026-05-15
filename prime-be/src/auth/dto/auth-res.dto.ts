import { SocialProvider } from '../interface/auth.interface';

export type UserInfo = {
  userName: string | null;
  userEmail: string | null;
};

export class PersonalLoginRes {
  status: 'success' | 'fail';
  message: string;
  reason?: 'personal' | 'social';
  fail?: 'email' | 'password' | 'social';
  data?: UserInfo;

  private constructor(
    status: 'success' | 'fail',
    message: string,
    reason?: 'personal' | 'social',
    fail?: 'email' | 'password' | 'social',
    data?: UserInfo,
  ) {
    this.status = status;
    this.message = message;
    if (reason) this.reason = reason;
    if (fail) this.fail = fail;
    if (data) this.data = data;
  }

  static success(reason: 'personal' | 'social', data: UserInfo) {
    return new PersonalLoginRes('success', '로그인 성공', reason, undefined, data);
  }

  static fail(fail: 'email' | 'password' | 'social', message = '로그인 실패') {
    return new PersonalLoginRes('fail', message, undefined, fail, undefined);
  }
}

export class LogoutRes{
    status: string;
    message: string;

    constructor(status: string='fail', message: string='로그아웃 실패'){
        this.status = status;
        this.message = message;
    }

    static of() {
        const result = new LogoutRes('success', '로그아웃 성공');
        return result;
    }
}

export class LoginRes{
    status: string;
    message: string;
    reason?: "social" | "personal";
    socialProvider?: SocialProvider;

    constructor(
        status: string='fail',
        message: string='로그인 실패',
        reason: 'social' | 'personal' = 'personal',
        socialProvider?: SocialProvider,
    ){
        this.status = status;
        this.message = message;
        this.reason = reason;
        this.socialProvider = socialProvider;
    }

    static of(
        status: string = 'success',
        message: string = '로그인 성공',
        reason: 'social' | 'personal' = 'social',
        socialProvider?: SocialProvider,
    ) {
        return new LoginRes(status, message, reason, socialProvider);
    }
}

export type SocialLinkFailReason =
  | 'not_found_user' | 'not_personal_account' | 'missing_social_id' | 'missing_social_email' | 'email_mismatch'| 'social_in_use';

export class SocialLinkCallbackRes {
    status: 'success' | 'fail';
    message: string;
    reason?: SocialLinkFailReason;
    socialProvider: SocialProvider;
    data: {
        accountEmail: string | null;
        socialEmail: string | null;
    };

    private constructor(
        status: 'success' | 'fail',
        message: string,
        socialProvider: SocialProvider,
        data: { accountEmail: string | null; socialEmail: string | null },
        reason?: SocialLinkFailReason,
    ) {
        this.status = status;
        this.message = message;
        this.socialProvider = socialProvider;
        this.data = data;
        if (reason) this.reason = reason;
    }

    static success(
        socialProvider: SocialProvider,
        data: { accountEmail: string | null; socialEmail: string | null },
    ) {
        return new SocialLinkCallbackRes('success', '소셜 연동 인증 완료', socialProvider, data);
    }

    static fail(
        reason: SocialLinkFailReason,
        socialProvider: SocialProvider,
        data: { accountEmail: string | null; socialEmail: string | null },
        message = '소셜 연동 인증 실패',
    ) {
        return new SocialLinkCallbackRes('fail', message, socialProvider, data, reason);
    }
}
