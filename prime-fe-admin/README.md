# prime-fe-admin

`prime-fe-admin`은 관리자 로그인과 관리자 콘솔 화면을 제공하는 React 기반 독립 앱입니다.

## 주요 기능

- 관리자 로그인 및 인증 상태 유지
- 대시보드
- 매물 관리
- 매물 검증
- 문의 관리
- 게시글 관리
- 회원 관리
- 네이버 지도 기반 위치 미리보기

## 기술 스택

- React 18
- react-router-dom 7
- axios
- react-scripts 5
- Tailwind CSS

## 실행 방법

```bash
npm install
npm start
```

개발 서버는 기본적으로 [http://localhost:3000](http://localhost:3000) 에서 실행됩니다.

## 환경변수

이 프로젝트는 `.env.local`만 사용합니다. 파일이 없다면 프로젝트 루트에 직접 생성해주세요.

```bash
# Optional: 별도 API 서버를 사용할 때 설정
# REACT_APP_API_BASE_URL=https://admin-api.example.com
REACT_APP_API_BASE_URL=http://localhost:3000

# 네이버 지도 SDK 클라이언트 키
REACT_APP_NAVER_MAP_CLIENT_KEY=your_naver_map_client_key
```

### 변수 설명

- `REACT_APP_API_BASE_URL`
  - 관리자 인증 및 매물 관련 API의 기본 주소입니다.
  - 값이 없으면 `/sign/in`, `/sign/out` 같은 same-origin 상대 경로로 요청합니다.
- `REACT_APP_NAVER_MAP_CLIENT_KEY`
  - 네이버 지도 SDK 로드에 사용됩니다.
  - 토지 매물 등록 화면의 지도 미리보기 기능에 필요합니다.

## 라우팅

- `/login`: 관리자 로그인
- `/admin`: 관리자 콘솔
- `/`: 인증 상태에 따라 `/login` 또는 `/admin`으로 리다이렉트
