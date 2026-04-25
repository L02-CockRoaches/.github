# Testing Guide

Project này nên tách test thành 2 lớp:

- Frontend Expo ở root repo, chạy bằng `jest-expo`
- Backend NestJS trong `backend/`, chạy bằng Jest config riêng của Nest

## Commands

```bash
npm run test
npm run test:watch
npm run test:coverage
npm run test:backend
```

## Frontend test structure

- Đặt test trong `__tests__/`
- Không đặt test trong `app/` vì Expo Router sẽ coi đó là route
- Ưu tiên test theo hành vi render, text, interaction

Ví dụ đề xuất:

```text
__tests__/
  app/
    profile-screen.test.tsx
  components/
    game-card.test.tsx
  utils/
    shape-score.test.ts
```

## Backend test structure

- Giữ test gần file service/controller trong `backend/src/**`
- Unit test service bằng mock Prisma hoặc mock dependency
- Chỉ viết e2e khi luồng API đã ổn định

Ví dụ đề xuất:

```text
backend/src/
  users/users.service.spec.ts
  scores/scores.service.spec.ts
  auth/auth.service.spec.ts
```

## Writing rules

- Một file test chỉ nên tập trung vào một module hoặc một màn hình
- Tên test mô tả hành vi, không mô tả implementation
- Mock ở mức thấp nhất đủ dùng, tránh mock quá nhiều tầng
- Với UI, kiểm tra text, accessibility, action; hạn chế snapshot tràn lan
