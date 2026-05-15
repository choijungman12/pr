import { SocialProvider } from 'src/auth/interface/auth.interface';

export type NormalizedGender = 'male' | 'female' | 'other' | null;

export interface InsertUserBySocialInput {
  provider: SocialProvider;
  email: string;
  phone?: string | null;
  gender?: string | null;
  name?: string | null;
}

export interface InsertUserBySocialData {
  email: string;
  phone: string | null;
  gender: NormalizedGender;
  name: string | null;
  socialNaver?: number;
  socialKakao?: number;
  socialGoogle?: number;
  socialApple?: number;
}

export function normalizeSocialGender(raw?: string | null): NormalizedGender {
  if (!raw) {
    return null;
  }

  const value = raw.trim().toLowerCase();
  if (value === 'm' || value === 'male') {
    return 'male';
  }

  if (value === 'f' || value === 'female') {
    return 'female';
  }

  return 'other';
}

export function toInsertUserBySocialData(input: InsertUserBySocialInput): InsertUserBySocialData {
  const data: InsertUserBySocialData = {
    email: input.email,
    phone: input.phone ?? null,
    gender: normalizeSocialGender(input.gender),
    name: input.name ?? null,
  };

  if (input.provider === 'naver') {
    data.socialNaver = 1;
  } else if (input.provider === 'kakao') {
    data.socialKakao = 1;
  } else if (input.provider === 'google') {
    data.socialGoogle = 1;
  } else if (input.provider === 'apple') {
    data.socialApple = 1;
  }

  return data;
}

export interface UpdateUserBySocialData {
  socialNaver?: number;
  socialKakao?: number;
  socialGoogle?: number;
  socialApple?: number;
}

export function toUpdateUserBySocialProvider(provider: SocialProvider): UpdateUserBySocialData {
  const data: UpdateUserBySocialData = {};

  if (provider === 'naver') data.socialNaver = 1;
  else if (provider === 'kakao') data.socialKakao = 1;
  else if (provider === 'google') data.socialGoogle = 1;
  else if (provider === 'apple') data.socialApple = 1;

  return data;
}