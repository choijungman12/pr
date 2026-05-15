import { removeCookie } from "../../utils/cookie/cookieUtils";

function MemberDelete() {
  const logoutHandler = () => {
    
  };

  const requestEmailAuth = async () => {
    const response = await fetch("http://192.168.0.6:3007/user/delete", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        credentials: "include",
      },
    });
    if (response.ok) {
      if (response.status === "success") {
        removeCookie("accessToken");
        removeCookie("refreshToken");
        logoutHandler();
      } else {
        console.log(response.message);
      }
    }
  };

  return (
    <div>
      <button onClick={requestEmailAuth}>회원탈퇴</button>
    </div>
  );
}
export default MemberDelete;
