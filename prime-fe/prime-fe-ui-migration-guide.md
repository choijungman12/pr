# Prime-FE UI/UX 마이그레이션 작업 가이드

> **목적**: prime-fe의 기술스택(CRA, JS, SCSS, Redux)은 유지하면서 prime의 UI/UX 디자인만 반영
> **범위**: 기능 추가 없음. 기존 화면의 시각적 디자인만 변경
> **작성일**: 2026-02-23

---

## 원칙

1. **기술스택 변경 없음**: CRA, JavaScript, SCSS, Redux, Axios 등 모두 유지
2. **기능 추가 없음**: 신규 페이지, 신규 패널, 신규 API 연동 없음
3. **디자인만 변경**: 색상, 폰트, 레이아웃, 애니메이션, 컴포넌트 스타일만 교체
4. **SCSS 유지**: Tailwind 도입 없이 기존 SCSS 구조에서 작업

---

## Phase 1: 디자인 토큰 교체

### 1.1 `variables.scss` 전면 개편

기존 prime-fe의 변수는 최소한(7개)이며 색상/폰트/간격 변수가 없음. prime 디자인 시스템의 토큰을 SCSS 변수로 정의.

```scss
// ============================================
// 기존 (prime-fe)
// ============================================
// $breakpoint-480: 480px;
// $header-height: 3.5rem;
// $ui-control-button-width: 3rem;
// ... (7개)

// ============================================
// 변경 후 (prime 디자인 반영)
// ============================================

// --- 색상: Primary ---
$color-primary: #f97316;        // orange-500
$color-primary-dark: #ea580c;   // orange-600
$color-primary-light: #fed7aa;  // orange-200
$color-primary-bg: #fff7ed;     // orange-50

// --- 색상: 기능별 ---
$color-sale: #f43f5e;           // rose-500 (매매)
$color-rent: #0ea5e9;           // sky-500 (전월세)
$color-presale: #10b981;        // emerald-500 (분양)
$color-auction: #f59e0b;        // amber-500 (경매)
$color-development: #8b5cf6;    // violet-500 (개발)

// --- 색상: 중립 ---
$color-bg-page: #f8fafc;        // slate-50
$color-bg-white: #ffffff;
$color-bg-light: #f1f5f9;       // slate-100
$color-bg-hover: #f8fafc;       // slate-50

$color-text-primary: #111827;   // gray-900
$color-text-secondary: #374151; // gray-700
$color-text-tertiary: #6b7280;  // gray-500
$color-text-disabled: #9ca3af;  // gray-400

$color-border: #e2e8f0;         // slate-200
$color-border-light: #f1f5f9;   // slate-100

// --- 그림자 ---
$shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
$shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
$shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
$shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
$shadow-2xl: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
$shadow-orange: 0 10px 15px -3px rgba(249, 115, 22, 0.3);

// --- 폰트 ---
$font-family: 'Noto Sans KR', 'Poppins', sans-serif;
$font-size-xs: 0.625rem;   // 10px
$font-size-sm: 0.75rem;    // 12px
$font-size-base: 0.875rem; // 14px
$font-size-md: 1rem;       // 16px
$font-size-lg: 1.125rem;   // 18px
$font-size-xl: 1.25rem;    // 20px
$font-size-2xl: 1.5rem;    // 24px

$font-weight-normal: 400;
$font-weight-medium: 500;
$font-weight-semibold: 600;
$font-weight-bold: 700;
$font-weight-extrabold: 800;

// --- 간격 ---
$space-1: 0.25rem;   // 4px
$space-2: 0.5rem;    // 8px
$space-3: 0.75rem;   // 12px
$space-4: 1rem;      // 16px
$space-5: 1.25rem;   // 20px
$space-6: 1.5rem;    // 24px
$space-8: 2rem;      // 32px

// --- 모서리 ---
$radius-sm: 0.375rem;  // 6px
$radius-md: 0.5rem;    // 8px
$radius-lg: 0.75rem;   // 12px
$radius-xl: 1rem;      // 16px
$radius-2xl: 1.5rem;   // 24px
$radius-full: 9999px;

// --- 트랜지션 ---
$transition-fast: 150ms ease;
$transition-base: 200ms ease;
$transition-slow: 300ms cubic-bezier(0.4, 0, 0.2, 1);

// --- 레이아웃 ---
$header-height: 3.5rem;
$left-toolbar-width: 4rem;          // 64px (도구 버튼)
$right-sidebar-width: 320px;
$breakpoint-480: 480px;
$breakpoint-768: 768px;
$breakpoint-1024: 1024px;

// --- Z-Index ---
$z-base: 0;
$z-marker: 10;
$z-toolbar: 20;
$z-overlay: 30;
$z-sidebar: 40;
$z-modal: 50;
```

### 1.2 `mixins.scss` 확장

```scss
// --- 기존 유지 ---
@mixin point480max { @media (max-width: #{$breakpoint-480}) { @content; } }

// --- 추가 ---
@mixin point768max { @media (max-width: #{$breakpoint-768}) { @content; } }
@mixin point1024max { @media (max-width: #{$breakpoint-1024}) { @content; } }

// 글래스 효과
@mixin glass {
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

// 그라디언트 텍스트
@mixin gradient-text {
  background: linear-gradient(135deg, $color-primary 0%, $color-primary-dark 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

// 3D 버튼
@mixin btn-3d {
  transform: translateY(0);
  box-shadow: 0 4px 0 rgba(0, 0, 0, 0.2), 0 6px 20px rgba(0, 0, 0, 0.1);
  transition: all $transition-fast;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 0 rgba(0, 0, 0, 0.2), 0 10px 25px rgba(0, 0, 0, 0.15);
  }
  &:active {
    transform: translateY(2px);
    box-shadow: 0 2px 0 rgba(0, 0, 0, 0.2), 0 3px 10px rgba(0, 0, 0, 0.1);
  }
}

// 호버 리프트
@mixin hover-lift {
  transition: transform $transition-base, box-shadow $transition-base;
  &:hover {
    transform: translateY(-2px);
    box-shadow: $shadow-lg;
  }
}

// 카드 기본 스타일
@mixin card {
  background: $color-bg-white;
  border-radius: $radius-xl;
  box-shadow: $shadow-md;
}

// 그라디언트 버튼 (Primary)
@mixin btn-primary {
  background: linear-gradient(135deg, $color-primary 0%, $color-primary-dark 100%);
  color: #fff;
  border: none;
  border-radius: $radius-lg;
  font-weight: $font-weight-semibold;
  box-shadow: $shadow-orange;
  transition: all $transition-fast;
  cursor: pointer;

  &:hover {
    filter: brightness(1.05);
    box-shadow: 0 12px 20px -3px rgba(249, 115, 22, 0.4);
  }
}
```

---

## Phase 2: 글로벌 베이스 스타일 변경

### 2.1 `base.scss` 수정

| 항목 | 기존 (prime-fe) | 변경 (prime 디자인) |
|------|----------------|-------------------|
| `body background` | `#090606` (거의 검정) | `$color-bg-page` (#f8fafc, 밝은 슬레이트) |
| `body color` | `#222222` | `$color-text-primary` (#111827) |
| `body font-family` | 시스템 기본 | `$font-family` (Noto Sans KR, Poppins) |
| `body line-height` | `1` | `1.5` |

```scss
// base.scss 수정 사항
body {
  font-family: $font-family;
  line-height: 1.5;
  color: $color-text-primary;
  background-color: $color-bg-page;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

// 스크롤바 커스터마이징 추가
::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-track { background: #f1f5f9; }
::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 3px; }
::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
```

### 2.2 `index.html` 수정

```html
<!-- 기존 없음 → 추가: 폰트 CDN -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;600;700;800&family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet">

<!-- 기존 없음 → 추가: 아이콘 CDN -->
<link href="https://cdn.jsdelivr.net/npm/remixicon@4.5.0/fonts/remixicon.css" rel="stylesheet">
<link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">
```

### 2.3 `index.scss`에 키프레임 애니메이션 추가

```scss
// 기존 애니메이션 유지 + 아래 추가
@keyframes fadeIn {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}

@keyframes slideInLeft {
  from { transform: translateX(-100%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}

@keyframes slideInRight {
  from { transform: translateX(100%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}

@keyframes slideInUp {
  from { transform: translateY(100%); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

@keyframes pulseMarker {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.1); opacity: 0.8; }
}

// 유틸리티 클래스
.animate-fadeIn { animation: fadeIn 0.2s ease-out; }
.animate-slideInLeft { animation: slideInLeft 0.3s $transition-slow; }
.animate-slideInRight { animation: slideInRight 0.3s $transition-slow; }
.animate-slideInUp { animation: slideInUp 0.3s $transition-slow; }
```

---

## Phase 3: 컴포넌트별 디자인 변경

### 3.1 Header 컴포넌트

**파일**: `src/sass/components/header.scss` + `src/components/Header/Header.js`

| 요소 | 기존 (prime-fe) | 변경 (prime 디자인) |
|------|----------------|-------------------|
| **배경** | 흰색, `border-bottom: 1px #e9ecef` | 흰색, `border-bottom: 1px $color-border`, `sticky top-0 z-40` |
| **패딩** | 중앙정렬, 기본 | `padding: 0 $space-6` (좌우 24px) |
| **로고 색상** | `#2463eb` (파란색) | `$color-primary` (#f97316, 오렌지) |
| **로고 폰트** | `1.3rem`, weight 1000 | `$font-size-xl`, weight `$font-weight-bold` |
| **로고 배지** | 없음 | `width: 40px; height: 40px; background: $color-primary; border-radius: $radius-lg;` (오렌지 사각형 아이콘) |
| **아바타** | 이미지 표시 | 로그인 버튼으로 교체: 오렌지 배경 + 흰 텍스트, `$radius-lg` |

```scss
// header.scss 변경
header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  height: $header-height;
  padding: 0 $space-6;
  background: $color-bg-white;
  border-bottom: 1px solid $color-border;
  position: sticky;
  top: 0;
  z-index: $z-sidebar;

  .header_logo {
    display: flex;
    align-items: center;
    gap: $space-3;

    &_icon {
      width: 40px;
      height: 40px;
      background: $color-primary;
      border-radius: $radius-lg;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      font-size: $font-size-lg;
      font-weight: $font-weight-bold;
    }

    &_text {
      font-size: $font-size-xl;
      font-weight: $font-weight-bold;
      color: $color-text-primary;
    }
  }

  .header_actions {
    display: flex;
    align-items: center;
    gap: $space-2;

    .btn-login {
      @include btn-primary;
      padding: $space-2 $space-4;
      font-size: $font-size-base;
    }
  }
}
```

### 3.2 Left Sidebar → Left Toolbar 스타일 변환

**파일**: `src/sass/components/left_side_bar.scss` + `src/components/LeftSideBar/LeftSideBar.js`

> prime-fe 좌측 사이드바(350px 너비, 메뉴+서브메뉴)를 prime의 아이콘 기반 툴바 스타일로 변환. 구조(JS)는 유지하되 CSS만 변경.

| 요소 | 기존 (prime-fe) | 변경 (prime 디자인) |
|------|----------------|-------------------|
| **너비** | `350px` (메뉴 90px + 서브메뉴) | 메인 메뉴: `80px` → 서브메뉴 클릭 시 서브메뉴 확장 |
| **메뉴 아이콘 크기** | `25px` SVG | `2rem` Remix Icon |
| **메뉴 배경** | `#fff` | `$color-bg-white` |
| **활성 상태** | `#eff6ff` bg + `#007eff` text | `$color-primary-bg` bg + `border: 2px solid $color-primary` |
| **호버 상태** | `#f8f9fa` bg | `transform: scale(1.05)`, `$shadow-lg` |
| **메뉴 항목** | 텍스트 위주 (15px) | 아이콘 중심 + 작은 라벨 (10px) |
| **구분선 색상** | `#e9ecef` | `$color-border` |
| **선택 강조** | 파란색 계열 | 오렌지 계열 |
| **검색바** | 사이드바 내 인풋 | 지도 위 플로팅 검색바 스타일 (아래 3.5 참고) |

```scss
// left_side_bar.scss 핵심 변경
.left_side_bar {
  background: $color-bg-white;
  border-right: 1px solid $color-border;

  .left_side_bar_main_menu {
    padding: $space-2;

    .left_side_bar_main_menu_item {
      width: 64px;
      height: 64px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: $space-1;
      border-radius: $radius-xl;   // 16px (기존 0)
      border: 2px solid transparent;
      background: $color-bg-white;
      box-shadow: $shadow-md;       // 그림자 추가
      cursor: pointer;
      transition: all $transition-base;

      i { font-size: 1.5rem; color: $color-text-tertiary; }
      span { font-size: $font-size-xs; font-weight: $font-weight-medium; color: $color-text-tertiary; }

      &:hover {
        transform: scale(1.1);
        box-shadow: $shadow-xl;
        border-color: $color-primary-light;
      }

      &.active {
        border-color: $color-primary;
        background: $color-primary-bg;
        i { color: $color-primary; }
        span { color: $color-primary; }
      }
    }
  }
}
```

### 3.3 Detail Sidebar (우측 상세 사이드바) 스타일 변환

**파일**: `src/sass/components/detail_sidebar.scss` + `src/components/DetailSidebar/DetailSidebar.js`

| 요소 | 기존 (prime-fe) | 변경 (prime 디자인) |
|------|----------------|-------------------|
| **너비** | `388px` | `$right-sidebar-width` (320px) |
| **배경** | `#fff` | `rgba(255,255,255,0.95)` + `backdrop-filter: blur(8px)` |
| **그림자** | `rgba(101,103,118,0.16) 0 0 12px` | `$shadow-2xl` |
| **진입 애니메이션** | `pcDetailIntro` (좌→우 50px) | `slideInRight` (우→좌 100%) |
| **닫기 버튼** | 빨간 SVG (#fc3059) | 회색 라운드 버튼 `$color-text-tertiary`, `$radius-full` |
| **데이터 박스 배경** | `#f7f8f9` | `$color-bg-light` (#f1f5f9) |
| **데이터 박스 모서리** | `5px` | `$radius-xl` (16px) |
| **데이터 박스 테두리** | `1px #e8eaea` | `1px solid $color-border` |
| **차트 박스 모서리** | `8px` | `$radius-xl` (16px) |
| **타이틀 색상** | `#333` | `$color-text-primary` |
| **값 강조 색상** | (없음) | `$color-primary` (오렌지) |

```scss
// detail_sidebar.scss 핵심 변경
.detail_sidebar_container {
  width: $right-sidebar-width;
  height: 100%;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(8px);
  box-shadow: $shadow-2xl;
  animation: slideInRight 0.3s $transition-slow;

  .detail_sidebar_data_box {
    background: $color-bg-white;
    border: 1px solid $color-border;
    border-radius: $radius-xl;
    padding: $space-4;
    transition: all $transition-base;

    &:hover { @include hover-lift; }
  }

  .detail_sidebar_data_title {
    font-size: $font-size-sm;
    font-weight: $font-weight-semibold;
    color: $color-text-secondary;
    margin-bottom: $space-2;
  }

  .detail_sidebar_data_value {
    font-size: $font-size-md;
    font-weight: $font-weight-bold;
    color: $color-text-primary;

    &.highlight { color: $color-primary; }
  }

  // 닫기 버튼
  .detail_sidebar_close {
    width: 36px;
    height: 36px;
    border-radius: $radius-full;
    background: $color-bg-light;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all $transition-fast;

    i { color: $color-text-tertiary; font-size: $font-size-lg; }
    &:hover { background: $color-border; }
  }
}
```

### 3.4 Right UI Control (지도 우측 컨트롤) 스타일 변환

**파일**: `src/sass/components/right_ui_control.scss` + `src/components/RightUIControl/RightUIControl.js`

| 요소 | 기존 (prime-fe) | 변경 (prime 디자인) |
|------|----------------|-------------------|
| **버튼 크기** | `3rem x 3rem` (48px) | `2.5rem x 2.5rem` (40px) |
| **버튼 모서리** | `5px` | `$radius-lg` (12px) |
| **버튼 그림자** | `0 2px 5px rgba(0,0,0,0.1)` | `$shadow-lg` |
| **활성 색상 (위성)** | `#2E63EB` (파란색) | `$color-primary` (오렌지) |
| **활성 색상 (레이어)** | `#38B44A` (초록) | `$color-primary` (오렌지) 또는 유지 |
| **활성 색상 (공공주택)** | `#ff0a00` (빨간) | `$color-primary` (오렌지) 또는 유지 |
| **호버 배경** | `#f0f0f0` | 스케일 효과 `transform: scale(1.05)` |
| **테두리** | `2px solid #e9ecef` | `border: none` (그림자로 대체) |
| **위치** | `fixed, top: calc(86px + 3.5rem)` | `absolute left-4 top-4` (지도 좌상단) |

```scss
// right_ui_control.scss 핵심 변경
.right_box {
  position: absolute;
  left: $space-4;
  top: $space-4;
  z-index: $z-toolbar;

  .right_inner {
    display: flex;
    flex-direction: column;
    gap: $space-2;
  }

  button {
    width: 40px;
    height: 40px;
    background: $color-bg-white;
    border: none;
    border-radius: $radius-lg;
    box-shadow: $shadow-lg;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all $transition-fast;
    cursor: pointer;

    i, svg { font-size: 1.25rem; color: $color-text-secondary; }

    &:hover {
      background: $color-bg-hover;
      transform: scale(1.05);
    }

    &.active {
      background: $color-primary;
      color: #fff;
      i, svg { color: #fff; }
    }
  }
}
```

### 3.5 검색바 스타일 변환

**파일**: `src/components/LeftSideBar/LeftSideBar.js` 내 검색 인풋

기존에는 좌측 사이드바 내 인풋. prime 디자인에서는 지도 위 플로팅 검색바.
> 검색바 위치를 변경할 수 없다면(기능 변경 없이) 인풋 스타일만 변경.

| 요소 | 기존 (prime-fe) | 변경 (prime 디자인) |
|------|----------------|-------------------|
| **높이** | `38px` | `48px~56px` |
| **모서리** | `5px` | `$radius-2xl` (24px, 둥근 알약형) |
| **그림자** | 없음 | `$shadow-2xl` |
| **테두리** | `1px solid #e9ecef` | `1px solid $color-border-light` |
| **패딩** | `0 24px 0 12px` | `$space-5` (20px) 좌우 |
| **포커스 테두리** | `#007eff` | `$color-primary` |
| **포커스 배경** | `#eff6ff` | `$color-bg-white` |
| **플레이스홀더 색상** | `#adb5bd` | `$color-text-disabled` (#9ca3af) |
| **검색 버튼** | 없음 (인풋만) | 오렌지 그라디언트 버튼 추가 (옵션) |

```scss
// 검색 인풋 변경
.search_input {
  width: 100%;
  height: 48px;
  padding: 0 $space-5;
  border: 1px solid $color-border-light;
  border-radius: $radius-2xl;
  font-size: $font-size-base;
  font-family: $font-family;
  background: $color-bg-white;
  box-shadow: $shadow-lg;
  transition: all $transition-base;

  &::placeholder { color: $color-text-disabled; }

  &:focus {
    outline: none;
    border-color: $color-primary;
    box-shadow: $shadow-2xl, 0 0 0 3px rgba($color-primary, 0.1);
  }
}
```

### 3.6 Custom Select 스타일 변환

**파일**: `src/sass/common/custom_select.scss`

| 요소 | 기존 | 변경 |
|------|------|------|
| **헤더 모서리** | `4px` | `$radius-lg` (12px) |
| **헤더 테두리** | `#dee2e6` | `$color-border` |
| **열림 테두리** | `#228be6` (파란) | `$color-primary` (오렌지) |
| **열림 그림자** | `rgba(34,139,230,0.1)` | `rgba($color-primary, 0.1)` |
| **옵션 모서리** | `6px` | `$radius-lg` |
| **옵션 그림자** | `0 4px 6px rgba(0,0,0,0.1)` | `$shadow-lg` |
| **선택 배경** | `#e7f5ff` (파란) | `$color-primary-bg` (오렌지) |
| **선택 텍스트** | `#228be6` | `$color-primary` |

### 3.7 로그인 페이지 스타일 변환

**파일**: `src/components/Member/Login.js` (및 관련 SCSS)

| 요소 | 기존 (prime-fe) | 변경 (prime 디자인) |
|------|----------------|-------------------|
| **레이아웃** | 단순 중앙 폼 | 2분할 (좌 브랜딩 + 우 폼) |
| **좌측 배경** | 없음 | `linear-gradient(to bottom right, $color-primary, $color-primary-dark, #f59e0b)` |
| **폼 카드** | 기본 | `$radius-2xl` (24px), `$shadow-xl`, 패딩 32px |
| **인풋 높이** | `38px` | `56px` (3.5rem) |
| **인풋 모서리** | `5px` | `$radius-xl` (16px) |
| **인풋 배경** | `#fff` | `$color-bg-light` |
| **인풋 아이콘** | 없음 | 좌측 아이콘 (이메일, 자물쇠) |
| **로그인 버튼** | 기본 스타일 | `@include btn-primary`, `@include btn-3d`, 높이 56px |
| **버튼 색상** | 파란 계열 | 오렌지 그라디언트 |
| **링크 색상** | (기본) | `$color-primary` |

```scss
// login.scss 추가 (또는 기존 스타일 수정)
.login_page {
  min-height: 100vh;
  display: flex;

  .login_branding {
    display: none;  // 모바일 숨김

    @media (min-width: $breakpoint-1024) {
      display: flex;
      width: 50%;
      background: linear-gradient(to bottom right, $color-primary, $color-primary-dark, #f59e0b);
      align-items: center;
      justify-content: center;
      padding: $space-8;
      color: #fff;
    }
  }

  .login_form_section {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: $space-8;
    background: $color-bg-light;

    @media (min-width: $breakpoint-1024) { width: 50%; }
  }

  .login_form_card {
    width: 100%;
    max-width: 400px;
    background: $color-bg-white;
    border-radius: $radius-2xl;
    box-shadow: $shadow-xl;
    padding: $space-8;
  }

  .login_input {
    width: 100%;
    height: 56px;
    padding: 0 $space-4 0 48px;
    background: $color-bg-light;
    border: 1px solid transparent;
    border-radius: $radius-xl;
    font-size: $font-size-base;
    font-family: $font-family;
    transition: all $transition-base;

    &:focus {
      outline: none;
      border-color: $color-primary;
      box-shadow: 0 0 0 3px rgba($color-primary, 0.15);
    }
  }

  .login_btn {
    @include btn-primary;
    @include btn-3d;
    width: 100%;
    height: 56px;
    font-size: $font-size-md;
  }
}
```

### 3.8 Skeleton 로딩 스타일 변환

**파일**: `src/sass/components/detail_sidebar_skeleton.scss`

| 요소 | 기존 | 변경 |
|------|------|------|
| **기본 색상** | `#e8eaed` | `$color-bg-light` |
| **하이라이트** | `#f0f0f0` | `$color-bg-hover` |
| **모서리** | `4px` | `$radius-lg` (12px) |
| **너비** | `388px` | `$right-sidebar-width` (320px) |

---

## Phase 4: 색상 테마 일괄 교체

기존 prime-fe 전체에서 파란색(#2463eb, #228be6, #007eff) 계열을 오렌지($color-primary) 계열로 교체.

### 4.1 검색 & 치환 매핑

| 기존 색상 | 용도 | 교체 색상 | SCSS 변수 |
|----------|------|----------|-----------|
| `#2463eb` | 로고, primary | `#f97316` | `$color-primary` |
| `#228be6` | 포커스 테두리 | `#f97316` | `$color-primary` |
| `#007eff` | 활성 메뉴, 포커스 | `#f97316` | `$color-primary` |
| `#eff6ff` | 활성 배경 | `#fff7ed` | `$color-primary-bg` |
| `#e7f5ff` | 선택 배경 | `#fff7ed` | `$color-primary-bg` |
| `#2E63EB` | 위성 버튼 활성 | `#f97316` | `$color-primary` |
| `#090606` | body 배경 | `#f8fafc` | `$color-bg-page` |
| `#e9ecef` | 테두리 | `#e2e8f0` | `$color-border` |
| `#f8f9fa` | 밝은 배경 | `#f8fafc` | `$color-bg-page` |
| `#f1f3f5` | 호버 배경 | `#f1f5f9` | `$color-bg-light` |
| `#222222` | 텍스트 | `#111827` | `$color-text-primary` |
| `#adb5bd` | 비활성 텍스트 | `#9ca3af` | `$color-text-disabled` |
| `#dee2e6` | 테두리 (중) | `#e2e8f0` | `$color-border` |

### 4.2 JS 인라인 스타일 내 색상도 교체

`Main.js` 등에서 인라인 스타일로 사용되는 색상:
```javascript
// 기존
style={{ backgroundColor: "#2E63EB", color: "white" }}

// 변경 (CSS 클래스 사용 권장, 불가 시 인라인 교체)
style={{ backgroundColor: "#f97316", color: "white" }}
```

---

## Phase 5: 아이콘 시스템 전환

> prime은 **Remix Icon (remixicon)** 만 실제 사용 (CDN 로드).
> lucide-react는 package.json에만 있고 미사용, Font Awesome도 CDN만 로드되고 미사용.

### 5.1 기존 SVG → Remix Icon 교체

prime-fe에서 사용하는 커스텀 SVG 아이콘을 prime이 실제 사용하는 Remix Icon 클래스로 교체.

**prime에서 실제 사용하는 아이콘 (컴포넌트별 매핑):**

#### Header 영역

| prime-fe 기존 아이콘 | → Remix Icon (prime 실제 사용) | 용도 |
|---------------------|-------------------------------|------|
| PRIME 텍스트 로고 | `ri-building-4-fill` | 로고 아이콘 |
| 아바타 이미지 | `ri-user-line` | 사용자/로그인 |

#### Left Sidebar (메뉴)

| prime-fe 기존 아이콘 | → Remix Icon (prime 실제 사용) | 용도 |
|---------------------|-------------------------------|------|
| 홈 SVG | `ri-home-4-line` | 아파트/매물 |
| 매물 SVG | `ri-auction-line` | 경매 |
| 토지 SVG | `ri-landscape-line` | 토지 |
| 게시글 SVG | `ri-building-line` | 도시개발 |
| (해당없음) | `ri-exchange-funds-line` | 외부거래 |
| (해당없음) | `ri-road-map-line` | 개발계획 |
| (해당없음) | `ri-newspaper-line` | 뉴스 |
| (해당없음) | `ri-shape-line` | 영역 드로잉 |
| (해당없음) | `ri-ruler-line` | 거리 측정 |

#### Right UI Control (지도 컨트롤)

| prime-fe 기존 아이콘 | → Remix Icon (prime 실제 사용) | 용도 |
|---------------------|-------------------------------|------|
| 위성 SVG | `ri-compass-3-line` | 위성/지도 타입 |
| 레이어 SVG | `ri-stack-line` | 레이어 토글 |
| 지적도 SVG | `ri-map-2-line` | 지적도 |
| 면적 계산 SVG | `ri-ruler-line` | 면적 측정 |
| 단위 전환 SVG | `ri-layout-grid-line` | 단위 전환 |
| 필터 SVG | `ri-filter-3-line` | 필터 |

#### Detail Sidebar (상세 사이드바)

| prime-fe 기존 아이콘 | → Remix Icon (prime 실제 사용) | 용도 |
|---------------------|-------------------------------|------|
| 닫기 SVG (빨간) | `ri-close-line` | 사이드바 닫기 |
| (해당없음) | `ri-map-pin-line` | 위치 표시 |
| (해당없음) | `ri-money-dollar-circle-line` | 가격 표시 |
| (해당없음) | `ri-building-4-line` | 건물 정보 |
| (해당없음) | `ri-line-chart-line` | 차트/추이 |
| (해당없음) | `ri-arrow-up-s-line` | 가격 상승 |
| (해당없음) | `ri-arrow-down-s-line` | 가격 하락 |

#### 검색바

| prime-fe 기존 아이콘 | → Remix Icon (prime 실제 사용) | 용도 |
|---------------------|-------------------------------|------|
| 돋보기 SVG | `ri-search-line` | 검색 |

#### 로그인 페이지

| prime-fe 기존 아이콘 | → Remix Icon (prime 실제 사용) | 용도 |
|---------------------|-------------------------------|------|
| (없음) | `ri-mail-line` | 이메일 인풋 |
| (없음) | `ri-lock-line` | 비밀번호 인풋 |
| (없음) | `ri-eye-line` / `ri-eye-off-line` | 비밀번호 표시/숨김 |
| (없음) | `ri-shield-check-line` | 안전거래 |
| (없음) | `ri-global-line` | 글로벌 투자 |
| (없음) | `ri-line-chart-line` | 실시간 분석 |

### 5.2 prime에서 가장 많이 사용하는 Remix Icon Top 20

| 아이콘 | 사용 빈도 | 주요 용도 |
|--------|----------|----------|
| `ri-close-line` | 50+ | 모든 닫기 버튼 |
| `ri-building-line` | 20+ | 건물/부동산 표시 |
| `ri-map-pin-line` | 15+ | 위치/주소 표시 |
| `ri-line-chart-line` | 15+ | 차트/분석 |
| `ri-money-dollar-circle-line` | 15+ | 가격/통화 표시 |
| `ri-building-4-line` | 12+ | 재개발/건물 |
| `ri-checkbox-circle-fill` | 10+ | 선택/체크 상태 |
| `ri-information-line` | 10+ | 정보 툴팁 |
| `ri-check-line` | 10+ | 완료 표시 |
| `ri-lightbulb-line` | 8+ | 팁/인사이트 |
| `ri-file-list-3-line` | 8+ | 정보 섹션 |
| `ri-arrow-left-line` | 7+ | 뒤로가기 |
| `ri-home-4-line` | 7+ | 매물/주거 |
| `ri-ruler-line` | 7+ | 면적/거리 |
| `ri-calendar-line` | 6+ | 날짜/일정 |
| `ri-subway-line` | 6+ | 지하철/교통 |
| `ri-search-line` | 5+ | 검색 |
| `ri-building-2-line` | 5+ | 오피스텔 |
| `ri-road-map-line` | 5+ | 개발계획 |
| `ri-shield-check-line` | 5+ | 인증/안전 |

> prime 프로젝트 전체에서 총 **157개** 고유 Remix Icon이 사용됨.

### 5.3 적용 방법 (JSX 내)

```jsx
// 기존 (prime-fe) — SVG 이미지 또는 인라인 SVG
<img src="/icons/home.svg" alt="home" />
<svg>...</svg>

// 변경 — Remix Icon 클래스
<i className="ri-home-4-line"></i>
```

### 5.4 아이콘 스타일링

```scss
// Remix Icon 공통 스타일
i[class^="ri-"] {
  font-size: 1.25rem;      // 기본 크기
  line-height: 1;
  color: $color-text-secondary;

  // 사이즈 변형
  &.icon-sm { font-size: 1rem; }
  &.icon-lg { font-size: 1.5rem; }
  &.icon-xl { font-size: 2rem; }
}
```

---

## Phase 6: 마커 스타일 개선

### 6.1 지도 마커 비주얼 업그레이드

기존 prime-fe의 기본 마커를 prime 스타일의 배지형 마커로 변경.
> 마커 데이터와 로직은 그대로 유지. CSS만 변경.

```scss
// 마커 기본 스타일 추가
.map_marker {
  padding: $space-2 $space-3;
  border-radius: $radius-xl;
  box-shadow: $shadow-xl;
  border: 2px solid #fff;
  font-size: $font-size-sm;
  font-weight: $font-weight-bold;
  color: #fff;
  cursor: pointer;
  transition: all $transition-base;
  white-space: nowrap;

  // 매매 마커
  &.sale {
    background: linear-gradient(135deg, $color-sale, darken($color-sale, 10%));
    box-shadow: $shadow-xl, 0 4px 12px rgba($color-sale, 0.4);
  }
  // 전월세 마커
  &.rent {
    background: linear-gradient(135deg, $color-rent, darken($color-rent, 10%));
    box-shadow: $shadow-xl, 0 4px 12px rgba($color-rent, 0.4);
  }

  &:hover {
    transform: scale(1.1);
    z-index: $z-modal;
  }

  // 마커 꼬리 (삼각형)
  &::after {
    content: '';
    position: absolute;
    left: 50%;
    bottom: -8px;
    transform: translateX(-50%);
    border-left: 8px solid transparent;
    border-right: 8px solid transparent;
    border-top: 10px solid currentColor;
  }
}
```

---

## 작업 체크리스트

### Phase 1: 디자인 토큰 (예상 1일)
- [ ] `variables.scss` 전면 개편 (색상, 폰트, 간격, 그림자, 모서리, Z-index)
- [ ] `mixins.scss` 확장 (glass, gradient-text, btn-3d, hover-lift, card, btn-primary)

### Phase 2: 글로벌 베이스 (예상 0.5일)
- [ ] `base.scss` 수정 (body 배경, 폰트, line-height)
- [ ] `index.html` 폰트 CDN 추가 (Noto Sans KR, Poppins)
- [ ] `index.html` 아이콘 CDN 추가 (Remix Icon, Font Awesome)
- [ ] 키프레임 애니메이션 추가 (fadeIn, slideIn, pulseMarker)
- [ ] 스크롤바 커스터마이징 추가

### Phase 3: 컴포넌트 스타일 (예상 3~4일)
- [ ] Header 스타일 변경 (로고, 색상, 레이아웃)
- [ ] Left Sidebar 스타일 변경 (아이콘 중심, 모서리, 그림자)
- [ ] Detail Sidebar 스타일 변경 (glass, 애니메이션, 카드 디자인)
- [ ] Right UI Control 스타일 변경 (모서리, 그림자, 위치)
- [ ] 검색바 스타일 변경 (둥근 알약형, 그림자)
- [ ] Custom Select 스타일 변경 (모서리, 색상)
- [ ] Login 페이지 스타일 변경 (2분할, 그라디언트, 인풋)
- [ ] Skeleton 스타일 변경 (모서리, 색상)

### Phase 4: 색상 테마 교체 (예상 1일)
- [ ] SCSS 파일 전체: 파란색 → 오렌지 교체 (13개 매핑)
- [ ] JS 인라인 스타일: 색상값 교체

### Phase 5: 아이콘 전환 (예상 1일)
- [ ] 커스텀 SVG → Remix Icon 클래스 교체
- [ ] JSX 내 아이콘 요소 교체

### Phase 6: 마커 스타일 (예상 0.5일)
- [ ] 지도 마커 CSS 추가 (배지형, 그라디언트, 호버)
- [ ] 마커 꼬리(삼각형) 스타일 추가

### 검증
- [ ] 전체 페이지 시각적 확인 (메인, 로그인, 상세)
- [ ] 모바일(480px) 반응형 확인
- [ ] 애니메이션/트랜지션 동작 확인
- [ ] 기존 기능(지도, API, Redux) 정상 동작 확인

**총 예상 작업일: 7~8일**
