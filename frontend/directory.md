## /frontend 디렉토리 구조 설계

```sh
/frontend
   ├─/public
   │      // 이미지 파일 관리
   │      logo.jpeg
   └─/src
     ├─/api
     │    // 서버와 API 통신하는 함수 관리
     │    apiManager.ts
     │    auth.ts
     │    (...)
     ├─/components
     │    // 공용 컴포넌트 관리
     ├─/constants
     │    // 컴포넌트별 상수 관리
     ├─/hooks
     │    // 커스텀 hook 관리
     ├─/pages
     │  │ // 페이지 단위 컴포넌트 관리
     │  ├─/user
     │  │ ├─/auth
     │  │ ├─/login
     │  │ └─(...)
     │  └─(...)
     │  _app.tsx
     │  index.tsx
     ├─/states
     │    // 전역 상태 관리
     │    alertSnackbar.ts
     │    (...).ts
     ├─/types
     │    // 컴포넌트별 새롭게 정의한 타입을 관리할 파일
     │    alertSnackbar.ts
     │    (...).ts
     └─/util
          // 기타 유틸리티 함수
          (...).ts
```
