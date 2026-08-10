# 📊 Daily Quant

개인 퀀트 리서치 플랫폼. **정적 프론트(GitHub Pages) + 데이터 파이프라인(GitHub Actions) + 계산 앱(Streamlit)** 3층 구조로 동작합니다.

- **프론트(`docs/`)** — 4개 탭 대시보드. GitHub Pages로 배포되는 순수 HTML/CSS/JS.
- **파이프라인(`pipeline/` + Actions)** — 매일 매크로 지표를 수집해 `docs/data/macro.json` 생성.
- **계산 앱(`streamlit_app/`)** — 백테스팅·목표주가 계산. Streamlit Community Cloud에 배포 후 프론트에서 링크로 연결.

---

## 📁 구조

```
dailyqaunt/
├── docs/                       # GitHub Pages (Settings → Pages → main /docs)
│   ├── index.html              # 4탭 SPA 껍데기
│   ├── assets/
│   │   ├── css/style.css        # 스크롤 스냅(가로) + 세로 스크롤
│   │   └── js/                  # app(라우팅) / home / industry / backtest / target
│   ├── data/
│   │   └── config.json          # 홈키워드·산업목록·계산법·Streamlit URL·백테스팅 팩터목록
│   └── content/
│       ├── keywords/*.md        # 홈탭 키워드별 글 (직접 작성)
│       ├── industries/*.md      # 산업분석 글 (직접 작성)
│       └── backtests/*.md       # 팩터별 백테스트 결과 글 (직접 작성)
│
├── pipeline/                     # (현재 미사용) 홈탭 개편으로 지표 수집은 연결 해제됨
│   ├── fetch_macro.py           # yfinance(+FRED GDP) → docs/data/macro.json
│   └── requirements.txt
│
├── streamlit_app/               # Streamlit Cloud 배포 (main file: Home.py)
│   ├── Home.py
│   ├── pages/
│   │   ├── 1_Backtest.py
│   │   ├── 2_New_Backtest.py    # 프론트 '파란 도형' 링크 대상
│   │   └── 3_Target_Price.py    # ?method=per|dcf|rim 쿼리 분기
│   └── requirements.txt
│
├── research/                     # 로컬 전용 리서치/백테스트 엔진 (추후 streamlit_app과 연결 예정)
│
├── .env.example                  # FRED_API_KEY 등 로컬 환경변수 템플릿
└── .github/workflows/update-data.yml   # 매일 06:00 KST + 수동 실행
```

## 🧩 탭별 동작

| 탭 | 아이콘 | 동작 |
| --- | --- | --- |
| 홈 | ⌂ | 가로 슬라이드로 키워드 선택 → `content/keywords/*.md` 렌더 (마크다운 글을 쓰면 그대로 올라감) |
| 산업분석 | ⌕ | 가로 슬라이드로 산업 선택 → `content/industries/*.md` 렌더 |
| 백테스팅 | ▤ | Find Alpha(팩터별 백테스트 결과 요약) 클릭 → 하단에 해당 팩터의 결과 글 렌더 · 파란도형(새 백테스팅) → Streamlit |
| 목표주가 | ◈ | 가로 슬라이드로 계산법 선택 → Streamlit 계산기 |

## 🚀 세팅

**1. GitHub Pages 켜기** — Settings → Pages → Source: `main` 브랜치 `/docs` 폴더.

**2. Streamlit 배포** — [share.streamlit.io](https://share.streamlit.io) 에서 이 repo 연결, Main file path `streamlit_app/Home.py`. 배포 URL을 `docs/data/config.json` 의 `targetMethods[].url`·`backtest.newBacktestUrl` 에 입력.

**3. 글 추가** — `docs/content/keywords/`(홈) · `industries/`(산업분석) · `backtests/`(백테스트 결과)에 `.md` 작성 → `config.json` 의 해당 목록(`homeKeywords`/`industries`/`backtest.factors`)에 항목 추가 → 커밋.

> 매크로 지표 파이프라인(`pipeline/`, `.github/workflows/update-data.yml`, `FRED_API_KEY`)은 홈탭 개편으로 **현재 미사용** 상태입니다. 지표 기능을 되살리지 않을 거라면 이 파일들을 삭제해도 됩니다.

## 🧪 로컬 테스트

```bash
python -m http.server -d docs 8000      # http://localhost:8000 에서 프론트 확인
pip install -r streamlit_app/requirements.txt
streamlit run streamlit_app/Home.py     # 계산 앱 확인
```

> 본 프로젝트는 투자 권유가 아니며 리서치/학습 목적입니다.
