# 대회 정보 에이전트 출력 규격

아래 내용을 대회 정보를 수집하는 AI 에이전트의 지시문에 그대로 붙여 넣으세요.

---

매주 다음 3개 파일을 출력해 주세요.

1. `tournaments.json`: 사이트에 올릴 전체 데이터셋
2. `YYYY-MM-DD.json`: 이번 주 변경 내역. 파일 이름은 generated_at 날짜와 같아야 합니다.
3. `tournament_changes_YYYY-MM-DD.md`: 사람 검토용 보고서 (기존과 동일)

## [1] tournaments.json

- 변경분이 아니라 **전체 대회**를 담아 주세요. 지난 대회(PAST)도 삭제하지 말고 유지합니다.
- 기존 schema 2.0 필드와 검증 원칙(공식 출처만, 미확인은 null, 이전 대회 규정 이월 금지)은 그대로 유지합니다.
- `registration_status` 는 `ANNOUNCED`, `UPCOMING`, `OPEN`, `CLOSING_SOON`, `CLOSED`, `PAST`, `CANCELLED` 또는 `null`(확인 불가) 중 하나만 씁니다.
- 날짜는 모두 `YYYY-MM-DD` 형식 또는 `null` 입니다.
- 모든 대회에 아래 필드를 추가해 주세요.

```json
"collection_no": 22,
"country_code": "us",
"region": "North America",
"ko": {
  "city": "카일루아코나",
  "country": "미국",
  "notes": "대회 개요 (1~3문장)",
  "registration": "접수 상태 설명 또는 null",
  "format": "경기 방식 설명 또는 null",
  "date_note": "날짜 관련 보충 설명 또는 null"
},
"visual": {
  "image_url": "https://upload.wikimedia.org/...",
  "source_page": "https://commons.wikimedia.org/wiki/File:...",
  "credit": "작성자 · CC BY-SA 4.0",
  "license_url": "https://creativecommons.org/licenses/by-sa/4.0/"
}
```

필드 규칙:

- `collection_no`: 사이트에 표시되는 대회 고유 번호입니다. **기존 대회의 번호는 절대 바꾸지 마세요.** 신규 대회는 현재 가장 큰 번호 + 1을 순서대로 부여합니다.
- `country_code`: ISO 3166-1 alpha-2 소문자 (예: us, jp, es). 국기 표시에 씁니다.
- `region`: 다음 중 하나만 씁니다. `Eastern Europe`, `Western Europe`, `North America`, `South America`, `Oceania`, `Central Asia`, `East Asia`(동남아 포함), `South Asia`, `West Asia`, `Africa`, `Other`.
- `ko`: 한국어 사용자에게 보이는 문구입니다. `city`, `country`, `notes`는 필수입니다. **영문 데이터가 바뀌면 `ko` 문구도 반드시 함께 고쳐 주세요.** 예를 들어 상태가 PAST로 바뀌면 "아직 종료된 대회가 아닙니다" 같은 이전 문구를 남기지 마세요.
- `visual`: 도시 사진입니다. **Wikimedia Commons 이미지만** 사용하고, 작성자와 라이선스를 정확히 적어 주세요. 라이선스를 확인할 수 없으면 추측하지 말고 `null`로 두세요. `null`이면 사이트가 배포할 때 Wikipedia/Commons에서 도시 사진을 자동으로 찾아 붙입니다. 기존 대회의 visual은 문제가 없으면 그대로 유지합니다. 단, `/cities/`로 시작하는 경로는 사이트에 저장된 사진이므로 그대로 두세요.

## [2] YYYY-MM-DD.json (변경 내역)

```json
{
  "generated_at": "2026-11-02",
  "headline_ko": "이번 주 변경 요약 한 문장",
  "headline_en": "One-sentence summary of this week's changes",
  "changes": [
    {
      "tournament_id": "TRN-2026-ARG-001",
      "change_type": "PAST",
      "label_ko": null,
      "label_en": null,
      "before_ko": "접수 종료",
      "after_ko": "종료 · 지난 대회",
      "before_en": "Closed",
      "after_en": "Past · Archive",
      "summary_ko": "변경 내용 설명 (1~2문장)",
      "summary_en": "Description of the change (1–2 sentences)"
    }
  ]
}
```

- `change_type`: `NEW`, `REGISTRATION_OPENED`, `CLOSING_SOON`, `DATE_CHANGED`, `REGISTRATION_CLOSED`, `PAST`, `CANCELLED`, `NEEDS_REVIEW`, `OTHER` 중 하나.
- `before_*` / `after_*`: 상태나 값이 바뀐 경우에만 짧게 적고, 그 외(NEW 등)에는 `null`.
- `label_ko` / `label_en`: 기본 분류명 대신 다른 제목을 쓰고 싶을 때만 입력하고, 보통은 `null`.
- 변경이 없는 대회는 넣지 마세요. `tournament_id`는 tournaments.json에 있는 값이어야 합니다.
