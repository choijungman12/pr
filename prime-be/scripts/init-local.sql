-- 로컬 개발용 초기화: 메인 DB(prime)와 공용 DB(prime_common) 2개 생성
-- 운영 환경에서는 절대 사용하지 마세요 (계정 비밀번호가 평문)

CREATE DATABASE IF NOT EXISTS prime
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

CREATE DATABASE IF NOT EXISTS prime_common
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

GRANT ALL PRIVILEGES ON prime.*        TO 'prime'@'%';
GRANT ALL PRIVILEGES ON prime_common.* TO 'prime'@'%';
FLUSH PRIVILEGES;

-- ─────────────────────────────────────────────────────────────
-- prime_common 스키마 (사용자/소셜계정/관리자)
-- Drizzle 마이그레이션을 도입하기 전까지의 부트스트랩 정의
-- ─────────────────────────────────────────────────────────────
USE prime_common;

CREATE TABLE IF NOT EXISTS `user` (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  email           VARCHAR(64) NOT NULL,
  password        VARCHAR(256) NULL,
  phone           VARCHAR(32) NULL,
  gender          VARCHAR(8) NULL,
  name            VARCHAR(32) NULL,
  personal_email  TINYINT DEFAULT 0,
  social_naver    TINYINT DEFAULT 0,
  social_kakao    TINYINT DEFAULT 0,
  social_google   TINYINT DEFAULT 0,
  social_apple    TINYINT DEFAULT 0,
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  status          TINYINT DEFAULT 1,
  UNIQUE KEY user_email_unique (email)
);

CREATE TABLE IF NOT EXISTS social_account (
  id                  INT AUTO_INCREMENT PRIMARY KEY,
  user_id             INT NOT NULL,
  social_user_email   VARCHAR(64) NOT NULL,
  provider            VARCHAR(256) NOT NULL,
  client              VARCHAR(32) NOT NULL,
  social_id           VARCHAR(256) NOT NULL,
  created_at          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at          DATETIME NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  status              TINYINT DEFAULT 1,
  UNIQUE KEY social_account_provider_client_social_id_unique (provider, client, social_id)
);

CREATE TABLE IF NOT EXISTS admin (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  login_id    VARCHAR(64) NOT NULL,
  password    VARCHAR(256) NOT NULL,
  name        VARCHAR(64) NULL,
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  status      TINYINT DEFAULT 1,
  UNIQUE KEY admin_login_id_unique (login_id)
);

-- 개발용 기본 관리자 (비밀번호: prime1234)
-- bcrypt cost=10 으로 해싱된 값. 운영에서는 절대 사용 금지.
INSERT INTO admin (login_id, password, name)
VALUES ('admin', '$2b$10$5xY8RJ8WJ.aQ8N9j6lJZRu7L7yQF2eDdLpQ7sH8aZ9q1JxKlH5N0e', '개발 관리자')
ON DUPLICATE KEY UPDATE login_id = login_id;

-- ─────────────────────────────────────────────────────────────
-- prime 스키마 (지역별 폴리곤·실거래) — 부트스트랩 최소 예시
-- 실제 운영 데이터는 별도 dump 적재 필요
-- ─────────────────────────────────────────────────────────────
USE prime;

CREATE TABLE IF NOT EXISTS city (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  table_name  VARCHAR(64) NOT NULL,
  geo         GEOMETRY NOT NULL SRID 4326,
  SPATIAL INDEX (geo)
);

-- 지역 테이블 1개 예시 (seoul). 실제로는 17개 시·도 테이블 모두 생성 필요.
CREATE TABLE IF NOT EXISTS seoul (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  land_type   VARCHAR(50) NOT NULL DEFAULT '0',
  land_area   DECIMAL(10,3) NOT NULL DEFAULT 0.000,
  land_name   VARCHAR(100) NOT NULL,
  amount      BIGINT NOT NULL,
  year        SMALLINT NOT NULL DEFAULT 0,
  month       TINYINT NOT NULL DEFAULT 0,
  day         TINYINT NOT NULL DEFAULT 0,
  geo         GEOMETRY NOT NULL SRID 4326,
  point       TEXT NOT NULL,
  data        LONGTEXT NOT NULL,
  SPATIAL INDEX (geo)
);

-- 등록된(검증 완료) 매물 테이블
CREATE TABLE IF NOT EXISTS region_article (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  table_name   VARCHAR(64) NOT NULL,
  real_region_id INT NULL,
  land_type    VARCHAR(50) NOT NULL DEFAULT '0',
  land_area    DECIMAL(10,3) NOT NULL DEFAULT 0.000,
  land_name    VARCHAR(100) NOT NULL,
  amount       BIGINT NOT NULL DEFAULT 0,
  year         SMALLINT NOT NULL DEFAULT 0,
  month        TINYINT NOT NULL DEFAULT 0,
  day          TINYINT NOT NULL DEFAULT 0,
  geo          GEOMETRY NOT NULL SRID 4326,
  point        TEXT NOT NULL,
  data         LONGTEXT NOT NULL,
  created_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  SPATIAL INDEX (geo)
);
