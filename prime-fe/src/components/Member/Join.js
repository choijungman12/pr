import { useEffect, useState } from "react";
import useEmailAuth from "../../hooks/useEmailAuth";
import { useNavigate } from "react-router-dom";

function Join() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    user_name: "",
    email: "",
    authCode: "",
    phone_number: "",
    birth_date: "",
    nick_name: "",
    password: "",
    checkPassword: "",
  });

  const [valid, setValid] = useState({
    user_name: false,
    email: false,
    auth: false,
    phone_number: false,
    birth_date: false,
    nick_name: false,
    password: false,
    checkPassword: false,
  });

  const [authDisabled, setAuthDisabled] = useState(true);
  const [authenticate, setAuthenticate] = useState(false);
  const [timer, setTimer] = useState(0);
  const { sendEmailAuth, verifyAuthCode } = useEmailAuth();

  const validationRules = {
    user_name: /^[A-Za-z가-힣]{2,}$/,
    email: /^(?=.{10,}$)[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    phone_number: /^[0-9]{11}$/,
    birth_date: /^[0-9]{8}$/,
    nick_name: /^[가-힣A-Za-z0-9]{2,}$/,
    password: /^(?=.{4,})[!-~]+$/,
  };

  // 모든 입력 변경 시 최신 값으로 form과 valid 업데이트
  const handleChange = (e) => {
    const { name, value } = e.target;
    // 최신 폼 값을 직접 계산하여 사용
    const updatedForm = { ...form, [name]: value };
    setForm(updatedForm);

    // 정규식 검증이 있는 필드 처리
    if (validationRules[name]) {
      const isValid = validationRules[name].test(value);
      setValid((prev) => ({ ...prev, [name]: isValid }));
    }

    // 비밀번호와 비밀번호 확인이 업데이트될 때 두 값이 동일한지 검사
    if (name === "password" || name === "checkPassword") {
      setValid((prev) => ({
        ...prev,
        checkPassword: updatedForm.password === updatedForm.checkPassword,
      }));
    }
  };

  // 이메일 인증 타이머
  useEffect(() => {
    if (authenticate) {
      setTimer(300); // 300초 = 5분
      const interval = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [authenticate]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  // 이메일 인증 요청
  const emailAuthHandle = async () => {
    if (!valid.email) return;
    const response = await sendEmailAuth(form.email);
    if (response.status === "success") {
      setAuthenticate(true);
    } else {
      console.log(response.message);
    }
  };

  // 인증번호 확인
  const authCodeHandle = async () => {
    if (!valid.email || !form.authCode) return;
    const response = await verifyAuthCode(form.email, form.authCode);
    console.log(response);
    if (response.status === "success") {
      setValid((prev) => ({ ...prev, auth: true }));
      setAuthenticate(false);
    } else {
      console.log(response.message);
    }
  };

  // 회원가입 제출
  const handleSubmit = async (e) => {
    e.preventDefault();
    const {
      user_name,
      email,
      phone_number,
      birth_date,
      nick_name,
      password,
      checkPassword,
    } = valid;
    if (
      user_name &&
      email &&
      phone_number &&
      birth_date &&
      nick_name &&
      password &&
      checkPassword
    ) {
      try {
        const { checkPassword, authCode, nick_name, ...data } = form;
        console.log(data);
        const response = await fetch("http://192.168.0.6:3007/user/create", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });
        if (response.ok) {
          const result = await response.json();
          if (result.status === "success") {
            navigate("/login");
          } else {
            console.log(result.message);
          }
        } else {
          console.error(response.statusText);
        }
      } catch (error) {
        console.error(error);
      }
    } else {
      console.log("입력값이 유효하지 않습니다.");
    }
  };

  // 이메일 유효성에 따라 인증하기 버튼 활성화
  useEffect(() => {
    setAuthDisabled(!valid.email);
  }, [valid.email]);

  return (
    <div className="min-h-screen flex bg-gray-50 items-center justify-center p-8">
      <form onSubmit={handleSubmit} method="post">
        <div>
          <label>이름</label>
          <input
            type="text"
            name="user_name"
            placeholder="아무개"
            onChange={handleChange}
          />
          {!valid.user_name && <span>2글자 이상 영어와 한글만 가능</span>}
        </div>
        <div>
          <label>이메일</label>
          <input
            type="text"
            name="email"
            placeholder="return2025@gmail.com"
            onChange={handleChange}
          />
          {!valid.email && <span>이메일 형식이 맞지 않음</span>}
          <button
            type="button"
            disabled={authDisabled}
            onClick={emailAuthHandle}
          >
            인증하기
          </button>
        </div>
        {authenticate && (
          <div>
            <div>
              <label>인증번호</label>
              <input
                type="text"
                name="authCode"
                onChange={handleChange}
                value={form.authCode}
              />
            </div>
            <div>{formatTime(timer)}</div>
            <button type="button" onClick={authCodeHandle}>
              확인
            </button>
          </div>
        )}
        <div>
          <label>비밀번호</label>
          <input
            type="text"
            name="password"
            placeholder="!qwe234"
            onChange={handleChange}
          />
          {!valid.password && <span>비밀번호 형식이 맞지 않음</span>}
        </div>
        <div>
          <label>비밀번호 확인</label>
          <input
            type="text"
            name="checkPassword"
            placeholder="!qwe234"
            onChange={handleChange}
          />
          {!valid.checkPassword && <span>동일하지 않음</span>}
        </div>
        <div>
          <label>전화번호</label>
          <input
            type="text"
            name="phone_number"
            placeholder="01033025803"
            onChange={handleChange}
          />
          {!valid.phone_number && <span>하이푼을 제외한 전화번호</span>}
        </div>
        <div>
          <label>생년월일</label>
          <input
            type="text"
            name="birth_date"
            placeholder="19990219"
            onChange={handleChange}
          />
          {!valid.birth_date && <span>년도, 월, 일 순으로 8자리</span>}
        </div>
        <div>
          <label>별명</label>
          <input
            type="text"
            name="nick_name"
            placeholder="별명"
            onChange={handleChange}
          />
          {!valid.nick_name && (
            <span>2글자 이상의 영어, 숫자, 한글만 가능</span>
          )}
        </div>
        <div>
          <button type="submit">회원가입 완료</button>
        </div>
      </form>
    </div>
  );
}

export default Join;
