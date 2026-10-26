# SuguWa Tournaments Information

https://tournaments.suguwa.com 의 소스 코드입니다.
GitHub에 올린 코드를 Cloudflare Workers가 자동으로 빌드·배포합니다.

## 매주 업데이트 방법

1. 에이전트에게서 `tournaments.json`과 `YYYY-MM-DD.json`(변경 내역)을 받습니다. 출력 규격은 [docs/agent-instructions.md](docs/agent-instructions.md)에 있습니다.
2. GitHub 저장소에서 `data` 폴더로 들어가 **Add file → Upload files**를 누릅니다.
   - `tournaments.json` → `data/` 에 업로드합니다. 기존 파일이 교체됩니다.
   - `YYYY-MM-DD.json` → `data/changes/` 에 업로드합니다. 매주 파일이 하나씩 쌓입니다.
3. **Commit changes**를 누릅니다.
4. 1~3분 뒤 사이트에 반영됩니다. 진행 상황은 Cloudflare 대시보드의 Workers → suguwa-tournaments → Deployments에서 확인할 수 있습니다.

### 대회 사진

사진은 아래 순서로 정해집니다. 신규 대회도 따로 할 일 없이 실제 도시 사진이 붙습니다.

1. **직접 올린 사진**: `public/cities/<대회ID>.jpg` 파일(png, webp도 가능)이 있으면 가장 먼저 씁니다. 예: `public/cities/TRN-2027-USA-HAW-001.jpg`. 자동으로 찾은 사진이 마음에 들지 않을 때 이 이름으로 업로드하면 교체됩니다. JSON은 고칠 필요가 없습니다.
2. **에이전트가 준 사진**: `tournaments.json`의 `visual.image_url`
3. **자동 검색 사진**: 위 둘이 없으면 배포할 때마다 해당 도시의 Wikipedia 문서에서 Wikimedia Commons의 무료 라이선스(CC BY·CC BY-SA·CC0·퍼블릭 도메인) 가로 사진을 찾아 씁니다. 촬영자와 라이선스는 대회 상세 페이지에 자동 표기됩니다. 어떤 사진이 선택됐는지는 Cloudflare 빌드 로그의 `도시 사진 자동 검색`에 나옵니다.
4. 사진을 찾지 못하거나 사진 링크가 깨지면 기본 수구 경기장 사진을 표시합니다.

가로형 이미지(16:10 정도, 1200px 이상)가 잘 맞습니다.

### 데이터에 오류가 있으면

빌드 전에 `scripts/prepare-data.mjs`가 데이터를 검사합니다. 오류가 있으면 **배포가 중단되고 공개 사이트는 이전 상태로 유지됩니다.**
Cloudflare 배포 기록의 빌드 로그에서 `데이터 오류 N건` 아래에 어느 대회의 어떤 항목이 문제인지 한국어로 표시됩니다. 그 내용을 에이전트에게 전달해 파일을 다시 받은 뒤 다시 업로드하세요.

`참고 사항`으로 표시되는 항목(사진 없음, 마감일이 지났는데 OPEN 상태 등)은 배포를 막지 않습니다. 다음 주 업데이트 때 에이전트에게 확인을 요청하면 됩니다.

### 이전 상태로 되돌리기

GitHub에서 `data/tournaments.json` → **History**를 열면 주차별 버전이 남아 있습니다. 원하는 버전의 파일을 받아 다시 업로드하면 됩니다.

## 폴더 구조

| 경로 | 내용 | 수정 주기 |
|---|---|---|
| `data/tournaments.json` | 전체 대회 데이터 (에이전트 출력물) | 매주 |
| `data/changes/*.json` | 주차별 변경 내역 → 새소식 페이지 | 매주 추가 |
| `public/cities/` | 대회 사진 (`<대회ID>.jpg`) | 신규 대회 시 |
| `app/` | 화면 코드 (디자인·문구) | 디자인 변경 시 |
| `scripts/prepare-data.mjs` | 데이터 검사 | 데이터 규격 변경 시 |
| `docs/agent-instructions.md` | 에이전트 출력 규격 | 규격 변경 시 |

## Cloudflare 최초 설정 (1회)

1. Cloudflare 대시보드 → **Workers & Pages** → **Create** → **Import a repository** → GitHub 연결 후 `suguwa-tournaments` 저장소를 선택합니다.
2. 설정값은 다음과 같습니다.
   - Project name: `suguwa-tournaments` (vite.config.ts의 name과 같아야 합니다)
   - Build command: `npm run build`
   - Deploy command: `npx wrangler deploy`
   - Root directory: 비워 둡니다
3. **Deploy**를 누르고 `https://suguwa-tournaments.<계정>.workers.dev` 주소에서 사이트가 정상인지 확인합니다.
4. 도메인을 연결합니다.
   - Cloudflare → suguwa.com → **DNS**에서 기존 `tournaments` 레코드(ChatGPT Sites를 가리키는 레코드)를 삭제합니다.
   - Workers → suguwa-tournaments → **Settings → Domains & Routes → Add → Custom domain** → `tournaments.suguwa.com` 을 입력합니다.
   - 레코드 삭제부터 연결 완료까지 몇 분간 사이트가 열리지 않을 수 있습니다.

## 내 컴퓨터에서 미리 보기 (선택)

Node.js 22.13 이상이 필요합니다.

```bash
npm ci
npm run dev      # 개발 서버
npm run check    # 데이터 검사 + 타입 검사 + 테스트
npm run build    # 배포용 빌드
```
