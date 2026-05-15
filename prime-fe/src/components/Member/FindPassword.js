import { useEffect, useState } from "react";
import useEmailAuth from "../../hooks/useEmailAuth";

function FindPassword() {
  const [form, setForm] = useState({
    email: "",
    authCode: "",
    password: "",
    checkPassword: "",
  });

  const [valid, setValid] = useState({
    email: false,
    auth: false,
    password: false,
    checkPassword: false,
  });

  const [visible, setVisible] = useState(false);
  // authenticate 상태: 0 - 이메일 입력, 1 - 인증번호 입력, 2 - 비밀번호 재설정
  const [authenticate, setAuthenticate] = useState(0);
  const [authDisabled, setAuthDisabled] = useState(true);
  const [passDisabled, setPassDisabled] = useState(true);
  const [timer, setTimer] = useState(0);
  const { sendEmailAuth, verifyAuthCode } = useEmailAuth();

  const validationRules = {
    email: /^(?=.{10,}$)[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    password: /^(?=.{4,})[!-~]+$/,
  };

  const handleValidation = (e) => {
    const { name, value } = e.target;
    const updatedForm = { ...form, [name]: value };
    setForm(updatedForm);

    if (validationRules[name]) {
      const isValid = validationRules[name].test(value);
      setValid((prev) => ({ ...prev, [name]: isValid }));
    }
  };

  useEffect(() => {
    setValid((prev) => ({
      ...prev,
      checkPassword: updatedPasswordMatches(form.password, form.checkPassword),
    }));
  }, [form.password, form.checkPassword]);

  const updatedPasswordMatches = (password, checkPassword) =>
    password !== "" && password === checkPassword;

  useEffect(() => {
    setAuthDisabled(!valid.email);
    setPassDisabled(!valid.checkPassword);
  }, [valid.email, valid.checkPassword]);

  useEffect(() => {
    if (authenticate === 1) {
      setTimer(300);
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

  const emailAuthHandle = async () => {
    if (!valid.email) return;
    const response = await sendEmailAuth(form.email);
    if (response === "success") {
      setAuthenticate(1);
    }
  };
  const authCodeHandle = async () => {
    if (!valid.email || !form.authCode) return;
    const response = await verifyAuthCode(form.email, form.authCode);
    if (response === "success") {
      setValid((prev) => ({ ...prev, auth: true }));
      setAuthenticate(2);
    }
  };

  const updatePasswordHandle = async () => {
    // const response = await fetch("http://192.168.0.6:3007/user/delete", {
    //   method: "POST",
    //   headers: {
    //     "Content-Type": "application/json",
    //     credentials: "include",
    //   },
    // });
    // if (response.ok) {
    //   console.log("인증번호 전송 성공");
    // }
  };

  const handleVisible = () => {
    setVisible((prev) => !prev);
  };

  return (
    <div className="min-h-screen flex bg-gray-50 items-center justify-center p-8">
      {authenticate === 0 && (
        <div>
          <label>이메일</label>
          <input
            type="text"
            name="email"
            placeholder="return2025@gmail.com"
            onChange={handleValidation}
            value={form.email}
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
      )}
      {authenticate === 1 && (
        <>
          <div>
            <label>인증번호</label>
            <input
              type="text"
              name="authCode"
              onChange={handleValidation}
              value={form.authCode}
            />
          </div>
          <div>{formatTime(timer)}</div>
          <button type="button" onClick={authCodeHandle}>
            확인
          </button>
        </>
      )}
      {authenticate === 2 && (
        <>
          <div>
            <label>비밀번호</label>
            <input
              type={visible ? "text" : "password"}
              name="password"
              placeholder="!qwe234"
              onChange={handleValidation}
              value={form.password}
            />
          </div>
          <div>
            <label>비밀번호 확인</label>
            <input
              type={visible ? "text" : "password"}
              name="checkPassword"
              placeholder="!qwe234"
              onChange={handleValidation}
              value={form.checkPassword}
            />
          </div>
          <button type="button" onClick={handleVisible}>
            비밀번호 보기
          </button>
          <button
            type="button"
            onClick={updatePasswordHandle}
            disabled={passDisabled}
          >
            확인
          </button>
        </>
      )}
    </div>
  );
}

export default FindPassword;
