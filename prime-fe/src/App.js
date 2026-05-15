import React from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Provider } from "react-redux";
import { useSelector } from "react-redux";
import { store } from "./redux/store";
import MetaTagSet from "./components/Header/MetaTag";
import Main from "./pages/Main/Main";
import AdminPage from "./pages/Admin/Admin";
import RouteChangeTracker from "./components/RouteChangeTracker/RouteChangeTracker";
import Login from "./components/Member/Login";
import FindPassword from "./components/Member/FindPassword";
import MemberUpdate from "./components/Member/MemberUpdate";
import Logout from "./components/Member/Logout";
import { isAdminUser } from "./utils/auth/authStorage";

function AdminRoute() {
  const authUser = useSelector((state) => state.auth.user);

  if (!isAdminUser(authUser)) {
    return <Navigate to="/" replace />;
  }

  return <AdminPage />;
}

function App() {
  return (
    <Provider store={store}>
      <MetaTagSet
        title="프라임 :: 부동산 지분거래소 "
        description="프라임 지분거래소는 부동산 지분 거래를 위한 온라인 플랫폼으로, 소액 투자자들에게 프리미엄 부동산 투자 기회를 제공합니다."
        keywords="부동산, 지분, 거래, 투자, 부동산투자, 지분거래, 부동산거래, 부동산 지분거래"
        url={process.env.PUBLIC_URL}
        imgsrc="https://readdy.ai/api/search-image?query=3D%20isometric%20illustration%20of%20modern%20city%20buildings%20with%20investment%20charts%20and%20coins%20floating%20around%20clean%20background%20professional%20business%20illustration%20minimalist%20style%20teal%20green%20theme&width=400&height=400&seq=login3d-user&orientation=squarish"
      />
      <BrowserRouter>
        <RouteChangeTracker />
        <Routes>
          <Route index element={<Main />} />
          <Route path="/admin" element={<AdminRoute />} />
          <Route path="/login" element={<Login />} />
          <Route path="/logout" element={<Logout />} />
          <Route path="/join" element={<Navigate to="/login" replace />} />
          <Route path="/find-password" element={<FindPassword />} />
          <Route path="/user-update" element={<MemberUpdate />} />
        </Routes>
      </BrowserRouter>
    </Provider>
  );
}

export default App;
