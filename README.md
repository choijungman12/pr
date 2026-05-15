# Prime 지분거래소 (Monorepo)

부동산 지분 거래를 위한 지도 기반 플랫폼 — 사용자 프론트엔드 · 백엔드 · 관리자 콘솔 통합 저장소.

> 운영 도메인: prime2x.com · 개발: dev.prime2x.com
> 학습 보고서: https://choijungman12.github.io/pr/

---

## 폴더 구성

| 폴더 | 역할 | 스택 | 진입 포트 |
|---|---|---|---|
| [`prime-fe/`](./prime-fe) | 사용자 프론트엔드 | CRA + React 18 + Redux Toolkit + SCSS | 3000 |
| [`prime-be/`](./prime-be) | NestJS 백엔드 | NestJS 10 + Drizzle ORM + MySQL2 | 3000 |
| [`prime-fe-admin/`](./prime-fe-admin) | 관리자 콘솔 | CRA + React 18 + Zustand + Tailwind | 3000 |

---

## 빠른 시작

### 1) 백엔드 (prime-be)

```bash
cd prime-be
cp .env.example .env          # 환경변수 채우기
docker compose -f docker-compose.local.yaml up -d   # MySQL + Adminer 실행
pnpm install
pnpm run start:dev            # http://localhost:3000
```

### 2) 사용자 프론트엔드 (prime-fe)

```bash
cd prime-fe
cp .env.example .env.local    # REACT_APP_BACKEND_URL 등 입력
npm install
npm start                     # http://localhost:3000 (BE와 포트 충돌 시 변경 필요)
```

### 3) 관리자 콘솔 (prime-fe-admin)

```bash
cd prime-fe-admin
cp .env.example .env.local
npm install
npm start                     # http://localhost:3000
```

---

## 아키텍처 한눈에

```
[prime-fe] ──┐                          ┌─ MySQL (GEOMETRY)
              ├─→ [prime-be NestJS] ───┤
[prime-fe-admin] ┘                       └─ data/polygon/index/*.json (RBush)
```

- prime-be의 `/polygon/{point,sgg,emd,publichouse,transactions,complex}` — 지도 폴리곤 조회 (zoom 별 분기)
- prime-be의 `/auth/*`, `/oauth/*`, `/user/*` — 일반 사용자/소셜 인증
- prime-be의 `/sign/*`, `/land/*` — 관리자 인증 + 매물 관리 (이 monorepo에서 신규 추가)
- prime-be의 `/geocoding`, `/geocoding/reverse` — 주소·좌표 변환

---

## 배포

세 컴포넌트 모두 GitHub Actions로 GHCR에 이미지를 빌드/푸시 후 SSH로 원격 서버에 docker compose pull/up 합니다. 각 폴더의 `.github/workflows/`와 `dockerfile`을 참고하세요.

| 컴포넌트 | 트리거 브랜치 | 이미지 | 서버 경로 |
|---|---|---|---|
| prime-fe | master / develop | ghcr.io/return-plus/prime-fe:latest | /var/www/html/prime |
| prime-be | master / develop | ghcr.io/return-plus/prime-be:latest | /var/www/html/prime |
| prime-fe-admin | main / dev | ghcr.io/return-plus/prime-fe-admin:latest | /var/www/html/prime_admin |

---

## 라이선스

UNLICENSED (사내 사용)
