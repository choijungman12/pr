export class SignInRes {
  login_id!: string;
  name?: string | null;

  static of(loginId: string, name?: string | null): SignInRes {
    return { login_id: loginId, name: name ?? null };
  }
}

export class SignOutRes {
  ok!: boolean;
  static ok(): SignOutRes {
    return { ok: true };
  }
}
