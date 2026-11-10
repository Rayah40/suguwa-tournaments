# 글로벌 아마추어·마스터즈 수구대회 주간 변경 보고서 — 2026-11-09

**전체 수록: 25건** · 신규 1건 · 상태 전환 1건 · 기존 검증 필요 2건(변경 JSON에는 미수록). 이 보고서는 `tournaments.json` 전체 데이터와 `2026-11-09.json` 변경 데이터의 사람 검토용 설명입니다.

## World Aquatics Masters

- **Budapest 2027** (`TRN-2027-HUN-WAM-001`, 번호 8): 월드 아쿠아틱스 공식 페이지에서 마스터즈 수구 **2027년 7월 11~17일** 유지 확인. 접수 일정 미발표. https://www.worldaquatics.com/competitions/5574/world-aquatics-masters-championships-budapest-2027
- **Beijing 2029** (`TRN-2029-CHN-WAM-001`, 번호 9): 개최도시 확정, 세부 개최일·수구 일정·접수 미발표. https://www.worldaquatics.com/news/3890742/beijing-announced-as-world-aquatics-championships-2029-host
- **Dubrovnik WP4 Masters 2026** (`TRN-2026-HRV-WAMWP4-001`, 번호 17): 8월 31일~9월 6일 개최 완료. WP4 마스터즈는 엘리트 국가대표 WP4 대회와 구분. https://masters.wp4dubrovnik.com/

## NEW

### 번호 25 — Malaysia Masters WP4 Water Polo Championships 2026

- **ID:** `TRN-2026-MYS-WP4-001` · **국가/도시:** 말레이시아 쿠알라룸푸르 · **일정:** 2026년 12월 4~6일.
- **장소:** National Aquatic Centre, Kuala Lumpur Sports City.
- **연령:** 31~45세, 46세 이상. 연령 산정일은 2026년 12월 31일.
- **경기 방식:** WP4(4대4). 포스터는 World Aquatics Rules 적용을 명시하지만 세트/피리어드 시간, 공격시간, 로스터, 타임아웃은 확인되지 않아 `null`.
- **마감:** 참가 의향(Expression of Interest) **11월 13일 18:00 MYT (UTC+8)**; 최종 팀 등록 **11월 27일 18:00 MYT**. 팀 매니저 회의 12월 3일 16:00 MYT.
- **접수 상태:** 두 마감일 모두 보고일 기준 30일 이내이므로 `CLOSING_SOON`으로 표시. **온라인 폼이 실제 열려 있는지는 미확인**; 포스터에 등록 URL 없음. 상세 `registration_note`에 구분 기재.
- **공식 증거:** Malaysia Aquatics(MAS) 공식 Instagram 포스터(사용자 제공). https://www.instagram.com/p/DfO1XvTRxRG/
- **이미지:** Commons 원본 직링크 및 작성자·CC BY-SA 3.0 확인. https://commons.wikimedia.org/wiki/File:Petronas_Towers_by_Day.jpg

## REGISTRATION OPENED

- 이번 주 신규로 확인된 기존 대회의 정식 접수 개시 없음. Barcelona Masters Cup 2027의 **사전등록**은 기존과 같이 진행 중: https://www.biwpa.com/masters/preregistration/

## CLOSING SOON

- **Malaysia WP4 (신규)**: 11월 13일 EOI, 11월 27일 팀 등록 마감. 신규 대회는 변경 JSON에서 중복 분류하지 않고 `NEW` 1건으로 기록.
- **Gozo (11월 27~29일)**: 공식 신청 버튼은 있으나 **마감일이 공식적으로 확인되지 않아** `CLOSING_SOON` 분류하지 않음. https://barracudasmalta.org/2026/06/04/gozo-to-host-second-international-masters-water-polo-tournament/

## DATE CHANGED

- 공식적으로 확인된 일정 변경 없음.

## REGISTRATION CLOSED

- 기존 대회 중 이번 주 새로 확인된 접수 종료 없음. NZ Masters (11월 13~15일)는 9월 14일 팀 등록이 이미 종료된 상태.

## PAST

### 번호 1 — Pan Pacific Masters Games 2026, Water Polo

- 수구 종목 **2026년 11월 6~8일** 개최 완료. 종합대회 전체 일정(11월 6~15일)과 구분하여 `PAST`로 갱신.
- 팀 접수 10월 11일, 개인 접수 10월 18일 마감은 기존 정보 유지.
- 공식 근거: https://mastersgames.com.au/sport/water-polo/

## CANCELLED

- 공식 취소 확인 없음.

## NEEDS REVIEW

### 번호 12 — SA Masters Water Polo Tournament 2027: 개최지 상충

- 기존 10월 26일 기록의 `venue=Kearsney College`를 유지했습니다. 그러나 **현재 직접 열린 공식 2027 전용 페이지는 `Michaelhouse, KZN`을 장소로 표기**하며 Kearsney를 예비 장소로 설명합니다. 이전 10월 공식 안내와 상충하므로 주최 측 확인 전까지 어느 한쪽을 확정하지 않습니다.
- 공식 전용 페이지: https://www.samasterswaterpolo.co.za/tournaments/2027-michaelhouse-kzn/

### 번호 14 — BIWPA Beach Water Polo 2027: 페이지 불일치

- 공식 대회 목록은 2027년 8월 27~29일 팔라모스 개최를 표시합니다. 검색 색인에는 2027 사전등록 문구가 보이지만 직접 열린 상세 페이지는 **2026년 대회 안내**를 표시합니다. 2027 전용 신청 링크·상태는 미검증으로 유지했습니다.
- 공식 목록: https://www.biwpa.com/tournaments/ · 상세: https://www.biwpa.com/beach-polo/

### 그 밖의 접수 확인 제한

- **Fall Brawl (11월 14~15일):** USAWP Sport80 로그인 장벽으로 팀 추가 접수 여부 미확인. https://tampawaterpolo.com/tournament/
- **Gozo (11월 27~29일):** Google Forms 접근 제한으로 제출 가능 여부 미확인. 주최 측 공식 자료는 11분×2회, 최소 6경기를 명시.
- **CBEM Brasil (번호 24):** 11월 2일 보고에서 24번으로 수록한 대회. 해당 보고의 원본 JSON 파일을 현재 실행 환경에서 읽을 수 없어 `tournament_id`는 기존 10월 26일 23개 기록과 공식 브라질 자료를 바탕으로 `TRN-2026-BRA-CBEM-001`로 임시 재구성했습니다. **실제 11월 2일 ID와 대조 후 확정해야 합니다.** 공식 웹 일정(10월 14~18일)과 기술규정(10월 13~18일)도 차이가 있어 날짜 설명에 기록했습니다. https://cbemmastergamesbrasil.org.br/c/cbem-master-games-brasil-2026/modalidades/polo-aquatico

## 데이터 품질·복원 한계

1. **11월 2일 전체 JSON의 원본 바이트에 접근할 수 없었습니다.** 읽을 수 있는 10월 26일 Schema 2.0 기록 23개와 11월 2일 보고 내용, 이번 주 공식 검증 결과로 25개 전체를 재구성했습니다. 따라서 11월 2일 버전의 일부 기존 `ko` 문구와 `visual` 4건, 24번의 정확한 `tournament_id` 보존을 검증할 수 없습니다. 이전 원본과의 1:1 무손실 동기화는 **미완료**입니다.
2. 모든 `collection_no`는 1~25 정수이며 기존 1~23 번호를 변경하지 않았습니다. `first_added_at`은 사용하지 않습니다. 지역은 사이트 고유 분류를 따랐습니다.
3. 신규 Commons `visual.image_url`은 `https://upload.wikimedia.org/` 원본 주소만 사용하며 `thumb.wikimedia.org`를 사용하지 않았습니다. 기존 `/cities/` 이미지는 이전 파일에 대한 접근이 제한되어 복원 여부를 보장하지 못합니다.
4. 단순 `last_verified_at` 갱신과 이전부터 검증이 필요했던 기존 항목은 변경 JSON에서 제외했습니다. 11월 2일 원본이 없어 정확한 한국어 이전 문구는 `null`로 유지하며, 정확한 필드 단위 비교는 미완료입니다.
5. **WP BEACH Mallorca 2027:** 주최 측은 '2027년 6월 돌아온다'고 예고했지만 2027년 참가 자격·정확한 날짜는 아직 별도 확인되지 않아 신규 번호를 부여하지 않았습니다. https://www.wp-camp.com/en/wp-beach-mallorca-2/
