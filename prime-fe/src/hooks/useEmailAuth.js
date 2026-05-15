const useEmailAuth = () => {
  const sendEmailAuth = async (email) => {
    try {
      const response = await fetch("http://192.168.0.6:3007/mail/send/1 ", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email }),
      });
      if (response.ok) {
        const result = await response.json();
        return result;
      } else {
        return response.statusText;
      }
    } catch (error) {
      return error;
    }
  };

  const verifyAuthCode = async (email, authCode) => {
    try {
      const data = {
        verifyCode: authCode,
        sendReason: 1,
      };
      const response = await fetch(
        `http://192.168.0.6:3007/auth/mail/verify-email/${email}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        }
      );
      if (response.ok) {
        const result = await response.json();
        return result;
      } else {
        return response.statusText;
      }
    } catch (error) {
      return error;
    }
  };

  return { sendEmailAuth, verifyAuthCode };
};
export default useEmailAuth;
