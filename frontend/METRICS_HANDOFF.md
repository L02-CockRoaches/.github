# Metrics Handoff (Team)

## 1) Trạng thái hiện tại
Đã triển khai pipeline thu thập metrics end-to-end:
- Frontend gửi event về backend qua `POST /v1/metrics`.
- Backend forward event lên Sentry.
- Backend đồng thời append event vào CSV để phân tích hành vi thực tế.

## 2) Luồng dữ liệu
1. UI gọi analytics service (`frontend/services/analytics.ts`).
2. Analytics gọi API client (`frontend/services/api.ts`) -> `trackMetric(...)`.
3. Backend nhận payload tại metrics controller (`backend/src/metrics/metrics.controller.ts`).
4. Metrics service (`backend/src/metrics/metrics.service.ts`) xử lý:
   - validate kích thước `properties`
   - ghi Sentry breadcrumb/message
   - append vào file CSV

## 3) CSV output ở đâu
Backend ghi CSV theo thứ tự ưu tiên:
- Nếu có env `METRICS_CSV_PATH` -> ghi vào path đó.
- Nếu không có env -> mặc định: `backend/storage/metrics_events.csv`.

Header CSV hiện tại:
`timestamp,event,sessionId,userId,screen,durationMs,success,sessionCount,isReturningUser,daysSinceLastSeen,mode,score,accuracy,endpoint`

## 4) Dữ liệu user đang thu thập
Payload hỗ trợ các trường:
- `event`, `timestamp`
- `sessionId`, `userId` (optional)
- `properties` (context theo từng event: screen, duration, mode, score, accuracy, endpoint...)

Retention context phía frontend có:
- `sessionCount`
- `isReturningUser`
- `daysSinceLastSeen`

## 5) File mẫu để phân tích nhanh
Đã có file mẫu 100 case:
- `artifacts/metrics_usage_sample.csv`

Có thể dùng file này để làm funnel, retention cohort cơ bản, và phát hiện event hiệu năng (`performance_api_slow`, duration cao bất thường).

## 6) Cách chạy local để sinh thêm case CSV thật
1. Chạy backend và frontend bình thường.
2. Thao tác app theo các flow (onboarding/home/game/profile).
3. Kiểm tra file CSV output ở mục (3).

## 7) API contract ngắn
Endpoint: `POST /v1/metrics`

Ví dụ body:
```json
{
  "event": "game_completed",
  "timestamp": "2026-05-24T10:30:00.000Z",
  "sessionId": "session-1",
  "userId": "42",
  "properties": {
    "screen": "game",
    "durationMs": 123000,
    "mode": "solo",
    "score": 7400,
    "accuracy": 90,
    "endpoint": "scores"
  }
}
```

## 8) Test coverage liên quan
- Backend: `backend/src/metrics/metrics.service.spec.ts`
  - kiểm tra forward Sentry
  - kiểm tra append CSV
  - kiểm tra reject payload quá lớn
- Frontend:
  - `frontend/__tests__/services/analytics.test.ts`
  - `frontend/__tests__/services/retention.test.ts`
  - `frontend/__tests__/services/api.test.ts`

## 9) Gợi ý báo cáo insight cho team
- Engagement: số event theo màn hình, tỉ lệ `onboarding_cta_pressed` -> `play_pressed`.
- Retention proxy: phân bố `sessionCount`, `isReturningUser`.
- Performance: top endpoint có `durationMs` cao, số lần `performance_api_slow`.
- Gameplay quality: completion rate (`game_started` -> `game_completed`) và phân bố `score`/`accuracy`.
