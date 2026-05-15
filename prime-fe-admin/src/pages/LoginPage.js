import LoginForm from "../features/auth/ui/LoginForm";

// LoginPage는 route entry 역할만 하고,
// 실제 인증 UI와 제출 로직은 auth feature 안에 둔다.
export default function LoginPage() {
  return <LoginForm />;
}
