# prime-be

프라임 지분거래소 백엔드 (NestJS 10 + Drizzle ORM + MySQL).

## 모듈 구성

| 경로 | 역할 |
|---|---|
| `src/auth/` | 일반 로그인 (`POST /auth/login`, `GET /auth/logout`) |
| `src/auth/strategy/` | 소셜 로그인 (Naver / Kakao / Google + Apple 별도) |
| `src/user/` | 회원가입·내 정보 조회·소셜 연동 |
| `src/sign/` | **관리자 인증** (`POST /sign/in`, `GET /sign/out`) |
| `src/land/` | **매물(토지) 등록·지역 코드 조회** (`POST /land/register`, `GET /land/table`) |
| `src/polygon/` | 좌표/시군구/읍면동/공공주택 폴리곤 조회 (RBush 인메모리 인덱스) |
| `src/polygon-transactions/` | 실거래·커스텀 영역 폴리곤 조회 (MySQL GEOMETRY) |
| `src/geocoding/` | 주소 ↔ 좌표 변환 (V-World API) |
| `src/drizzle/` | DB 커넥션·스키마 |

## 로컬 실행

### 1) DB 준비 (Docker)

```bash
docker compose -f docker-compose.local.yaml up -d
```

- MySQL 8.0 (포트 3306) + Adminer (포트 8080)
- 초기화 SQL: [`scripts/init-local.sql`](./scripts/init-local.sql)
  - DB `prime`, `prime_common` 자동 생성
  - 인증 테이블(`user`, `social_account`, `admin`) 부트스트랩
  - 지역 테이블 1개(`seoul`) 부트스트랩 — 운영 데이터는 별도 dump 적재 필요
  - 기본 관리자 계정: `admin` / `prime1234`

Adminer: http://localhost:8080 (server: mysql, user: prime, pw: prime_local_pass)

### 2) 환경변수

```bash
cp .env.example .env
```

`.env`의 OAuth/지도 API 키는 비워두면 해당 기능만 비활성화됩니다. JWT 시크릿(`JWT_TOKEN_SECRET_KEY`)은 반드시 채우세요.

### 3) 의존성 설치 & 실행

```bash
pnpm install   # (또는 npm install --legacy-peer-deps)
pnpm run start:dev
```

NestJS는 기본 3000 포트에서 응답합니다. FE 포트 충돌 시 `.env`의 `PORT`를 변경하세요.

### 4) 동작 확인

```bash
# 관리자 로그인 (init-local.sql의 기본 계정)
curl -i -X POST http://localhost:3000/sign/in \
  -H "Content-Type: application/json" \
  -d '{"login_id":"admin","password":"prime1234"}'

# 등록 가능한 지역 코드
curl http://localhost:3000/land/table
```

## 폴리곤 인덱스 파일

서버 부팅 시 `data/polygon/index/{eupmeoundong|sigungu}.index.json`을 읽어 RBush 메모리 인덱스를 구축합니다 (`src/polygon/service/polygon.service.ts` → `onModuleInit`). 인덱스 파일은 별도 적재가 필요하며 [`scripts/build-polygon-index.ts`](./scripts/build-polygon-index.ts)로 재생성할 수 있습니다.

## 배포

`.github/workflows/deploy.yml`이 master/develop push 시 GHCR로 이미지를 푸시하고 SSH로 원격 서버에 docker compose 갱신합니다. 환경변수는 GitHub Secrets에서 주입됩니다.
