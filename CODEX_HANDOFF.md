# GOFITGYM PT Manager 인수인계서

이 문서는 새 Codex 대화에서 작업을 이어갈 때 가장 먼저 참고할 프로젝트 운영 문서입니다.

새 대화 시작 시에는 아래처럼 지시하면 됩니다.

```text
D:\cording\pt manage 프로젝트의 CODEX_HANDOFF.md를 먼저 읽고, 그 기준대로 작업해줘.
기존 기능과 데이터 구조를 보존하고, 사용자-visible 변경이면 버전 bump, 검증, 커밋/푸시, GitHub Pages 확인까지 해줘.
```

## 프로젝트 위치

- 로컬 경로: `D:\cording\pt manage`
- 주요 앱 파일: `manage.html`
- 서비스 워커: `service-worker.js`
- 매니페스트: `manifest.webmanifest`
- GitHub 저장소: `https://github.com/Ahnbk/gofitgym-pt-manager`
- GitHub Pages: `https://ahnbk.github.io/gofitgym-pt-manager/manage.html`

## 현재 기준 상태

- 최근 작업 기준 커밋: `8d1ab56 Add editable renewal history`
- 앱 표시 버전: `1.51`
- 앱 캐시 버전: `gofitgym-pt-v151`
- 서비스 워커 캐시: `gofitgym-pt-v151`

최근 반영된 주요 기능:

- 회원 상세의 `재등록` 메뉴에 재등록 이력 표시 추가
- 재등록 이력 수정 기능 추가
- 수정 가능 항목:
  - 유료 세션 수
  - 서비스 세션 수
  - 재등록일
  - 결제일
  - PT 매출
  - 회원권 매출
- 이미 서명 완료된 회차보다 적게 줄이는 것은 차단
- 미서명 회차를 줄일 때는 확인창 표시

주의:

- 직전 확인 시 GitHub 원격 `main`에는 최신 코드가 올라갔으나 GitHub Pages 배포가 지연될 수 있었음.
- 작업 시작 전 GitHub Pages가 최신 버전을 응답하는지 확인할 것.

## 작업 시작 루틴

```powershell
cd "D:\cording\pt manage"
git status -sb
rg -n "APP_DISPLAY_VERSION|APP_CACHE_VERSION|CACHE_NAME" manage.html service-worker.js
```

기능 수정 전에는 반드시 관련 DOM id, 함수명, 상태 변수를 `rg`로 먼저 찾고 주변 코드를 읽는다.

예:

```powershell
rg -n "openAddSessionModal|renewal|serviceSession|localSaveMember" manage.html
```

## 핵심 원칙

1. 기존 데이터 보존이 최우선이다.
2. 추측으로 수정하지 말고 현재 코드 흐름을 확인한다.
3. 대부분의 로직은 `manage.html` 안에 있다.
4. 앱 사용자가 보는 변경이면 버전을 반드시 올린다.
5. 앱 코드 변경 후에는 검증 명령을 통과시킨다.
6. 완료 후 관련 파일만 커밋하고 `main`에 푸시한다.
7. GitHub Pages 반영까지 확인한다.

## 수정 범위 원칙

기본 수정 대상:

- `manage.html`
- `service-worker.js`

다른 파일 수정은 명확한 이유가 있을 때만 한다.

작업 중 다음 untracked 파일들이 보일 수 있다. 앱 작업과 무관하므로 건드리지 않는다.

- `.codex-remote-attachments/`
- `duplicate_*.csv`
- `duplicate_*.xlsx`
- `duplicate_*.ods`
- `duplicate_*.txt`
- `election_results_20240410.csv`
- `same_total_pairs_grouped_view.xlsx`

## 버전 관리 규칙

사용자에게 보이는 앱 변경이면 아래 세 곳을 같이 올린다.

`manage.html`

```js
const APP_CACHE_VERSION = 'gofitgym-pt-v152';
const APP_DISPLAY_VERSION = '1.52';
```

`service-worker.js`

```js
const CACHE_NAME = 'gofitgym-pt-v152';
```

문서만 수정하는 경우에는 앱 버전 bump가 필요 없다.

## 필수 검증 명령

앱 코드 변경 후 반드시 실행한다.

```powershell
node -e "const fs=require('fs'); const vm=require('vm'); const html=fs.readFileSync('manage.html','utf8'); const scripts=[...html.matchAll(/<script(?![^>]*src=)[^>]*>([\s\S]*?)<\/script>/gi)].map(m=>m[1]); scripts.forEach((code,i)=>{new vm.Script(code,{filename:'script-'+i+'.js'}); console.log('script',i,'ok')});"
```

```powershell
node -e "const fs=require('fs'); JSON.parse(fs.readFileSync('manifest.webmanifest','utf8')); new Function(fs.readFileSync('service-worker.js','utf8')); console.log('manifest ok'); console.log('service worker syntax ok');"
```

```powershell
git diff --check
```

## 커밋/푸시 규칙

```powershell
git status -sb
git add manage.html service-worker.js
git commit -m "간결한 영어 커밋 메시지"
git push origin main
```

문서만 바꿨다면 해당 문서만 add한다.

푸시 후 확인:

```powershell
curl.exe -s "https://ahnbk.github.io/gofitgym-pt-manager/manage.html?v=cache-buster" | Select-String "APP_DISPLAY_VERSION|APP_CACHE_VERSION"
curl.exe -s "https://ahnbk.github.io/gofitgym-pt-manager/service-worker.js?v=cache-buster" | Select-String "CACHE_NAME"
```

GitHub Pages가 아직 이전 버전을 응답하면 raw GitHub와 Actions 상태를 분리해서 확인한다.

```powershell
curl.exe -L -s "https://raw.githubusercontent.com/Ahnbk/gofitgym-pt-manager/main/manage.html" | Select-String "APP_DISPLAY_VERSION|APP_CACHE_VERSION"
gh run list --limit 5
gh api repos/Ahnbk/gofitgym-pt-manager/pages --jq "{status:.status, branch:.source.branch, path:.source.path}"
```

## 데이터 보존 규칙

다음 데이터는 기존 사용자의 실제 운영 데이터다. 구조 호환을 반드시 유지한다.

- 회원 목록
- 수업 회차
- 서명 이미지
- 운동일지
- 상담기록
- 결제 이력
- 재등록 이력
- 서비스 세션
- 정산 데이터
- 스케줄
- 반복 스케줄
- 구글 캘린더 연결 정보
- 로컬 사용자 데이터
- 클라우드 사용자 데이터
- 접근 승인/차단 기록

새 필드를 추가할 때:

- 기존 데이터에 값이 없어도 오류 없이 동작해야 한다.
- 가능하면 member 객체 내부에 optional field로 저장한다.
- 저장은 기존 helper를 우선 사용한다.

기존 helper 우선순위:

- `localSaveMember`
- `localSaveSchedule`
- `saveDatabase`
- `saveCloudDocument`
- `deleteCloudDocument`
- `showToast`
- `escapeHtml`
- `formatDisplayDate`
- `formatDate`

## 저장/백업/클라우드 규칙

- 클라우드가 켜져 있어도 로컬 저장은 계속 되어야 한다.
- 로컬 백업은 회원, 일정, 서명, 운동일지, 상담기록, 결제/재등록 이력, 정산 관련 데이터를 포함해야 한다.
- 비동작하는 Google Drive 직접 업로드나 이메일 직접 전송 버튼은 만들지 않는다.
- 가능한 방식:
  - 로컬 백업 파일 저장
  - 네이티브 공유
  - 파일 선택 복원
  - 사용자가 직접 드라이브에 올릴 수 있는 흐름

## 인증/접근 권한 규칙

- 관리자는 클라우드 동기화를 사용할 수 있다.
- 승인받은 일반 사용자는 기본적으로 로컬 모드 사용이다.
- Firebase 사용자가 있다고 해서 자동 허용하면 안 된다.
- 접근 흐름:
  - 사용자가 이름/이메일/비밀번호로 사용 허가 요청
  - 관리자가 승인/차단/삭제
  - 차단된 사용자는 관리자 조치 없이는 사용 불가
- 로그인/가입 관련 동작은 사용자가 결과를 알 수 있게 toast 또는 상태 메시지를 표시한다.

## 구글 캘린더 규칙

- 관리자 클라우드 모드에서만 구글 캘린더 연결을 확인한다.
- 로컬 사용자에게 캘린더 로그인을 강제하지 않는다.
- 기본 일정 길이는 60분이다.
- 신규 일정, 이동, 삭제, 대시보드 오늘수업 취소 시 캘린더 연결이 있으면 반영을 시도한다.
- 전체 반영은 differential sync 방식으로 유지한다.
  - 동일한 일정은 skip
  - 삭제된 stale 일정은 정리
  - 중복 생성 금지
- 캘린더 이벤트 제목은 compact하게 유지한다.
  - 예: `[G]조미경`
  - 긴 `GOFITGYM` 텍스트나 장소 표기로 블럭이 복잡해지면 안 된다.

## UI/UX 기준

- 태블릿 가로 사용을 1순위로 고려한다.
- 모바일 세로에서도 버튼이 잘리지 않고 터치 가능해야 한다.
- PC에서도 사용 가능해야 한다.
- 업무용 관리 앱이므로 compact하고 직관적인 UI를 유지한다.
- 랜딩페이지, 히어로 섹션, 장식성 그래픽은 만들지 않는다.
- 터치 버튼은 대략 38~44px 이상을 목표로 한다.
- 상단 검은 헤더는 메인 카드 폭과 시각적으로 맞춘다.
- 모바일에서는 상단 헤더 아이콘을 compact하게 유지한다.
- 기존 색상 체계는 stone/amber/emerald 중심이다.

## 대시보드 규칙

- 오늘 예약 회원은 예약 시간순 정렬
- 오늘 예약이 없는 회원은 ㄱㄴㄷ순 정렬
- 오늘 예약 강조는 시간과 테두리 중심
- 오늘 예약이라는 이유만으로 잔여횟수 배지를 강조하지 않는다.
- 잔여횟수 3회 이하 등 낮은 잔여 강조는 `잔여 n회` 배지 자체에 적용한다.
- 회원 탭:
  - 진행중
  - 완료
  - 보류/인계
- 회원 길게 누르기 메뉴는 유지한다.
  - 보류/인계 이동
  - 오늘 수업 취소

## 회원 상세 규칙

- 상단 액션:
  - 재등록
  - 메모
  - 상담기록
  - 삭제
- 회원명 옆 트레이너명 중복 표시 금지
  - 트레이너명은 앱 상단 헤더에서 유지
- 회원명은 길면 truncate 처리
- 버튼이 모바일에서 밀려 화면 밖으로 나가면 안 된다.
- 진행률 패널은 compact/collapsible 성격 유지
- 재등록 메뉴에는 이력 표시와 수정 기능이 있어야 한다.
- 회원정보 수정에서는 기존 입력값을 불러와 수정 가능해야 한다.
- 결제 이력 확인이 가능해야 한다.

## 재등록/결제 이력 규칙

- 재등록 시 입력:
  - 유료 세션 수
  - 서비스 세션 수
  - 재등록일
  - 결제일
  - PT 매출
  - 회원권 매출
- PT 1회 단가는 PT 매출과 유료 세션 수로만 계산한다.
- 회원권 매출은 당월 매출에는 포함하지만 PT 단가 계산에는 포함하지 않는다.
- 재등록 이력 수정 시:
  - 이미 서명 완료된 회차보다 적게 줄일 수 없다.
  - 미서명 회차를 제거해야 하면 확인창을 띄운다.
  - 서비스 세션도 별도로 보존/수정한다.

## 레슨 타임라인 규칙

- 모든 대기 회차를 길게 나열하지 않는다.
- 기본 구조:
  - 서명 완료 내역
  - 다음 레슨 서명 한 줄
- 서명 완료 내역이 2개 이상이면 접기
- 서명 완료 row:
  - `00회차 완료`를 크게 표시
  - 날짜와 `서명완료`는 옆에 70% 정도 크기로 표시
- 마지막 서명 완료 시:
  - 재등록 여부를 묻는다.
  - 아니오면 완료 회원으로 이동한다.
  - 재등록이면 재등록 메뉴를 연다.
- 서비스 세션은 다음 서명 row에 `다음 레슨 서명(서비스 세션)`처럼 표시한다.

## 서명 규칙

- 서명 모달은 맞은편 회원이 보기 쉽게 counter-side signing을 지원한다.
- 모바일 세로 화면에서는 서명 순간 가로형 패드를 제공한다.
- 저장된 서명 이미지는 정방향이어야 한다.
- 기존 서명 보기/미리보기는 정방향이어야 한다.
- 재서명 시 다시 회전 입력 모드로 들어갈 수 있다.
- 서명 패드는 최대한 넓게 유지한다.
- 서명 이미지는 최적화된 data URL로 저장해 용량을 관리한다.
- 서명 삭제는 확인창 필수다.

## 운동일지 규칙

- 탭 이름은 `운동일지`
- `개인 운동 기록지` 같은 중복 텍스트는 표시하지 않는다.
- 카드/그리드 방식으로 표시한다.
- 최신순/오래된순 정렬 제공
- 카드 클릭 시 큰 편집 모달을 연다.
- 편집 모달:
  - 읽기 쉬운 큰 textarea
  - 날짜 입력
  - 공유/복사/삭제/닫기
  - autosave 가능
  - 입력 중 전체 render로 커서가 사라지면 안 된다.
- 전체 일지 공유는 모든 운동일지를 포함한다.
- 단일 일지 공유 문구:
  - `[GOFITGYM]` prefix
  - 회원님 호칭
  - 담당자
  - 진행세션/총세션
  - 다음 예약이 있으면 포함
  - 운동 내용
  - `오늘도 고생하셨습니다!`

## 상담기록 규칙

`member.consultation` 객체 사용.

고정 필드:

- 아침 기상시간 및 취침시간
- 식사시간 기록
- 음주빈도
- 원하는 운동목표
- 일과 운동 외의 활동
- 최근 병원진료를 받았거나 받을 예정이 있는지
- 진료를 받았다면 어떤 것 때문인지
- 간단한 운동테스트 결과
- 쪼그려앉기 / 만세해보기
- 기타 사항

값이 하나라도 있으면 `상담기록 있음` 표시.

## 스케줄러 규칙

- 흰 배경, 검은/stone 계열 grid line 유지
- 일정 블럭은 파란색 + 흰 글씨 유지
- 오늘 날짜 칸은 옅은 주황색
- 오늘 요일칸은 한 단계 진하게 표현하고 외곽 테두리 적용
- 상단 요일 header sticky
- 좌측 시간 column sticky
- 현재 시간선은 선으로만 표시하고 빨간 원은 표시하지 않는다.
- 확대/축소, 좌우 이동이 사용성을 해치지 않아야 한다.
- 일정 길게 누르기:
  - 브라우저 기본 context menu 차단
  - 앱 메뉴 표시
  - 이동/삭제 제공
- 일정 이동:
  - 이동 모드 표시
  - 취소 가능
  - 빈 칸만 선택 가능
  - 이미 일정 있는 칸은 toast로 거부
- 반복 일정 삭제:
  - 이 일정만 삭제
  - 이 일정 포함 이후 반복 일정 모두 삭제
  - 선택 확인 후 실행

## 공유 문구 규칙

- `[GOFITGYM]` prefix 사용
- 회원 이름은 문장 안에서 `회원님`을 붙인다.
- 제목에 이미 이름/날짜가 있으면 본문에서 중복 제거
- 다음 예약은 있을 때만 표시
- 운동일지 단일 공유에는 마지막 인사 포함:
  - `오늘도 고생하셨습니다!`
- 줄바꿈이 뭉개지면 안 된다.

## PDF 규칙

- PDF 미리보기와 다운로드 모두 페이지에 맞게 표시
- `NaN/3 페이지` 같은 카운터 오류 금지
- 하단 잘림 금지
- lesson check PDF와 workout PDF는 가능한 compact table
- 필요한 경우 좌우 2열 레이아웃 사용
- 정산 PDF는 날짜/이름/서명 증빙이 중앙 정렬과 균등 칸 크기를 유지해야 한다.
- PDF 관련 버튼은 관련 탭 안에서 접근 가능해야 한다.

## 정산 규칙

- 정산 기간은 매월 1일부터 말일까지
- 정산은 승인받은 로컬 사용자들이 관리자에게 보고하기 위한 기능이다.
- 월별 콤보박스가 필요하다.
- 정산 접근 시 비밀번호 재확인을 요구한다.
- 정산에는 다음을 고려한다.
  - PT 매출
  - 회원권 매출
  - 매출 합계
  - 매출구간별 배분율
  - 인센티브
  - 수업 완료/서명 증빙
  - 최종 지급액
- 결제일 기준 월별 매출 기록이 반영되어야 한다.
- 서명받은 수업을 기준으로 정산 수업이 계산된다.
- 이전 완료분 중 이번 달 반영분도 별도로 입력 가능해야 한다.
- 정산 PDF 첫 페이지는 표처럼 직관적인 구조를 유지한다.
- 서명증빙 PDF는 좌우 2열 균등 분할을 유지한다.

## 삭제/감소 확인 규칙

항상 확인창이 필요한 작업:

- 회원 삭제
- 운동일지 삭제
- 서명 삭제
- 일정 삭제
- 반복 일정 삭제
- 접근 승인/차단/삭제
- 백업 복원/롤백
- 잔여 수업 감소
- 재등록 이력 수정으로 미서명 회차 제거

확인 문구는 삭제/제거 대상과 복구 가능성을 구체적으로 알려야 한다.

## 입력 중 focus 보존

운동일지, 메모, 상담기록, 회원정보 입력 중에는 사용자가 타이핑할 때 커서가 사라지면 안 된다.

주의:

- `oninput`에서 전체 화면 render 금지
- autosave는 가능하지만 DOM 재생성은 debounce하거나 저장만 수행
- 카드 목록 갱신은 입력 모달을 닫을 때 하거나 focus를 해치지 않는 방식으로 한다.

## 새 기능 추가 전 체크리스트

- 이 기능이 기존 데이터와 충돌하지 않는가?
- 기존 backup/restore에 자연스럽게 포함되는가?
- cloud sync에서 빠지지 않는가?
- 모바일 세로 화면에서 버튼이 눌리는가?
- 태블릿 가로 화면에서 정보 밀도가 적절한가?
- 삭제/감소/덮어쓰기 확인창이 필요한가?
- 앱 버전 bump가 필요한가?
- 검증 명령을 통과했는가?

## 새 대화용 인수인계 프롬프트

아래 문장을 새 대화 첫 메시지로 사용한다.

```text
이 프로젝트는 D:\cording\pt manage 의 GOFITGYM PT Manager PWA야.
먼저 CODEX_HANDOFF.md를 읽고 그 기준대로 작업해줘.

대부분의 앱 로직은 manage.html 안에 있고, PWA 캐시는 service-worker.js에서 관리해.
기존 회원 데이터, 서명, 운동일지, 상담기록, 스케줄, 정산, 결제/재등록 이력, 로컬/클라우드 저장 구조를 절대 깨면 안 돼.

작업 전 rg로 관련 코드를 확인하고, 사용자-visible 변경이면 APP_CACHE_VERSION, APP_DISPLAY_VERSION, CACHE_NAME을 올려줘.
작업 후에는 문법 검증, manifest/service-worker 검증, git diff --check를 통과시키고 커밋/푸시한 뒤 GitHub Pages 반영까지 확인해줘.
```
