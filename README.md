# Dr SAIhib
### Your AI Doctor, Right in Your Village

**Dr SAIhib** is a sovereign, **offline-first** AI health companion built for rural India. It runs entirely on-device — no internet, no cloud, no server — and gives multilingual symptom triage, early-warning screening for serious illnesses, emergency (SOS/CPR) guidance, and ASHA worker support to people who have limited access to doctors and connectivity.

**Track:** Sovereign AI · **Event:** ASYNC'26, Ramaiah Institute of Technology · **Team:** [team name]

---

## 1. Context & Overview

### Elevator Pitch
Millions in rural India lack quick access to a doctor, and poor connectivity locks them out of most health apps. Dr SAIhib lets anyone — even someone who cannot read — describe symptoms by tapping pictures, speaking, or showing a photo, in English, Hindi, or Kannada, and get instant, trustworthy triage guidance, medicine suggestions, and early-warning hints for serious conditions like cancer, TB, and diabetes. No data ever leaves the device.

**Target audience:** rural families, elderly patients, low-literacy users, and ASHA/frontline health workers.

**Core features:**
- One-tap SOS / Ambulance call
- Step-by-step pictorial CPR guide
- Offline, rule-based symptom triage across 30+ conditions
- Cancer and underlying-disease early-warning screening (never a diagnosis)
- Dedicated pregnancy care checklist with red-flag detection
- Age-based vaccination tracking, auto-flagged to ASHA workers
- Voice input and text-to-speech in 3 languages
- Photo capture for rashes/wounds, saved for ASHA/doctor review
- Printable "Health Advice Slip"
- "Man Ki Baat" — a rule-based emotional support companion with crisis hand-off
- Patient ID system with full offline history, stored permanently in IndexedDB

### Badges & Status

| Build | Coverage | Code Quality | Status |
|---|---|---|---|
| ![Static Site](https://img.shields.io/badge/build-static--site--no--CI--required-lightgrey) | ![Manual QA](https://img.shields.io/badge/QA-manual--checklist-yellow) | ![HTML5 Valid](https://img.shields.io/badge/HTML5-validated-brightgreen) | ![Maturity](https://img.shields.io/badge/maturity-hackathon--MVP-orange) |

> This is a zero-backend, single-file offline app — there is no server to deploy and no CI/CD pipeline in the traditional sense. See [§5 Benchmarks & Maturity](#benchmarks--maturity-status) for how we validate quality instead.

### Demo
- Screenshots: `/docs/screenshots/` 
*( home screen ![home screen](image-1.png) & ![home screen](image-2.png),
ambulance SOS ![ambulance SOS](image-19.png), 
CPR ![CPR](image-20.png), 
symptom flow  ![  symptom flow](image-3.png) ![symptom flow](image-4.png) ![symptom flow](image-5.png) ![symptom flow](image-6.png) ![symptom flow](image-7.png) ![symptom flow](image-8.png) ![symptom flow](image-9.png) ![symptom flow](image-10.png) ![symptom flow](image-11.png),
Early detection of Cancer ![ Cancer](image-21.png) ![ Cancer](image-22.png) ![ Cancer](image-23.png) ,
 Man Ki Baat ![ Man Ki Baat](image-24.png) ,
 result screen ![result](image-12.png) ![result](image-13.png) ![result](image-14.png) ![result](image-15.png) ![result](image-16.png), ASHA portal ![ASHA portal](image-17.png) ![ASHA portal](image-18.png))*
 
- Demo video: *[add link here]*
- Live/offline demo: open `index.html` directly, or scan the QR code in `/docs/demo-qr.png`

---

## 2. Architecture & System Design

### High-level architecture
Dr SAIhib is a **single-page, client-only application**. There is no backend and no network calls at runtime — everything runs inside the browser sandbox on-device.

```
┌─────────────────────────────────────────────────────────┐
│                     index.html (SPA)                     │
│                                                           │
│  ┌───────────────┐  ┌────────────────┐  ┌─────────────┐ │
│  │  UI Layer      │  │  Triage Engine  │  │  i18n Layer │ │
│  │  (screens,     │◄─►  (rule-based,   │  │  (EN/HI/KN  │ │
│  │  wizard steps) │  │  knowledge base)│  │  dictionary)│ │
│  └───────┬────────┘  └────────┬────────┘  └─────────────┘ │
│          │                    │                           │
│  ┌───────▼────────────────────▼────────┐                 │
│  │      Web Platform APIs               │                 │
│  │  Web Speech API · Camera (file input) │                 │
│  │  Speech Synthesis · Geolocation       │                 │
│  └───────┬───────────────────────────────┘                │
│          │                                                │
│  ┌───────▼────────┐        ┌──────────────────┐          │
│  │   IndexedDB     │        │  Service Worker   │          │
│  │ (patients,      │        │  (optional —      │          │
│  │  checks, photos,│        │  offline caching  │          │
│  │  ASHA contacts) │        │  when hosted)      │          │
│  └────────────────┘        └──────────────────┘           │
└─────────────────────────────────────────────────────────┘
```

### End-to-end execution flow
```
User opens app
   │
   ▼
Home screen (SOS / CPR / Health Checkup) ──► [SOS] → tel:108 (no further steps)
   │                                          [CPR] → pictorial guide (local only)
   ▼
[Health Checkup]
   │
   ▼
Patient ID (new/returning) ──► IndexedDB lookup/creation
   │
   ▼
Age → Gender → (Vaccination check if <18) → (Pregnancy path if applicable)
   │
   ▼
Purpose: Symptom check / Cancer early-warning
   │
   ▼
Symptom selection (body map / category / voice / photo / "Other")
   │
   ▼
Follow-up questions (duration, severity, worsening)
   │
   ▼
Triage engine scores against knowledge base + red-flag overrides
   │
   ▼
Result screen (severity, advice, precautions, ASHA/emergency contacts)
   │
   ▼
Auto-saved to IndexedDB ──► Printable Health Advice Slip
   │
   ▼
(If flagged) → ASHA Worker Portal follow-up queue
```

### Documentation links
- Design/spec doc: `/docs/spec.md`
- Knowledge base schema: `/docs/knowledge-base-schema.md`
- Translation dictionary reference: `/docs/i18n-reference.md`
- *(No external API spec — the app has no network-facing API surface by design.)*

---

## 3. Installation & Configuration

### Prerequisites & tech stack
| Component | Requirement |
|---|---|
| Runtime | Any modern browser (Chrome/Chromium ≥ 90 recommended for Web Speech API support) |
| Node.js | Not required to run the app; ≥ 18.x only if using local tooling/scripts in `/tools` |
| Hardware | Any Android/iOS phone or desktop; no GPU required |
| Storage | ~5–10 MB free device storage (IndexedDB) |
| Build tools | None — zero build step by design |

### Step-by-step installation

**Option A — Run directly (fastest, fully offline)**
```bash
git clone https://github.com/<your-org>/dr-saihib.git
cd dr-saihib
# Open index.html directly in a browser, or double-tap it on a phone
```

**Option B — Serve locally (for full service-worker/PWA behavior)**
```bash
git clone https://github.com/<your-org>/dr-saihib.git
cd dr-saihib
python3 -m http.server 8080
# then open http://localhost:8080 in your browser
```

**Option C — Package as an installable Android app**
```bash
npm install -g @capacitor/cli
npx cap init "Dr SAIhib" "com.async26.drsaihib"
npx cap add android
# copy index.html, sw.js, manifest.json into /www
npx cap open android
# build a signed APK from Android Studio
```

### Environment variables matrix
Dr SAIhib has **no backend and no secrets**, so there is no `.env` file required to run it. The only device-side, user-configurable values are stored in IndexedDB via the in-app Settings screen, not as environment variables:

| Key | Description | Type | Default | Required |
|---|---|---|---|---|
| `asha_name` | ASHA worker's display name | string | `""` | No |
| `asha_phone` | ASHA worker's phone number | string | `""` | No |
| `emergency_number` | Ambulance number shown on SOS screen | string | `"108"` | Yes (pre-set) |
| `helpline_number` | Health helpline number | string | `"104"` | Yes (pre-set) |
| `crisis_helpline` | Suicide-prevention helpline (KIRAN) | string | `"1800-599-0019"` | Yes (pre-set) |
| `asha_pin` | 4-digit PIN for the ASHA portal | string | `"0000"` (change before deployment) | Yes |

---

## 4. Developer Experience & Quality Control

### Usage snippets

**Triage engine — scoring a symptom set:**
```javascript
const result = triageEngine.evaluate({
  symptoms: ["fever", "headache", "body_ache"],
  age: 34,
  durationDays: 2,
  severity: "moderate",
  existingConditions: [],
});
console.log(result.severity);       // "Moderate"
console.log(result.topConditions);  // ["Viral fever", "Flu"]
```

**Reading/writing a patient record:**
```javascript
const patient = await db.patients.get(patientId);
await db.checks.add({ patientId, symptoms, result, date: Date.now() });
```

**Translation lookup:**
```javascript
t("checkBtn", currentLang); // → "Check symptoms" / "लक्षण जांचें" / "ಲಕ್ಷಣಗಳನ್ನು ಪರಿಶೀಲಿಸಿ"
```

### Testing & QA commands
Since this is a static, dependency-free client app, QA is intentionally lightweight and manual rather than pipeline-driven:

```bash
# HTML validation
npx html-validate index.html

# JS linting
npx eslint index.html --ext .html

# Accessibility audit (run against a locally served instance)
npx pa11y http://localhost:8080

# Manual QA checklist (see /docs/qa-checklist.md)
# Covers: all 3 languages, voice input, camera capture, offline/airplane-mode
# behavior, SOS/CPR flow, print output, and ASHA portal PIN flow.
```

---

## 5. Reliability, Performance & Security

### Benchmarks & Maturity Status
**Maturity: Hackathon MVP (Alpha)** — functionally complete for the demo scope, not yet clinically validated or production-hardened.

| Metric | Result |
|---|---|
| Time to interactive (offline, cached) | < 1s on mid-range Android |
| Symptom → result latency | < 100ms (client-side rule evaluation, no network round-trip) |
| App size (single HTML file) | ~200–400 KB (no external assets) |
| Offline availability | 100% after first load (service worker) or immediately if run via `file://` |
| Language coverage | 3/3 target languages, full UI + knowledge base |

### Troubleshooting & known limitations

| Issue | Cause | Workaround / Trade-off |
|---|---|---|
| Microphone button missing | Web Speech API unsupported on this browser or under `file://` | App falls back to tap/picture-based input automatically |
| Camera shows blank preview | `getUserMedia` blocked on non-HTTPS origins | Falls back to native camera via `<input type="file" capture>` |
| Data disappears after reinstall | IndexedDB cleared by OS/browser storage limits | Use "Export data" regularly; `navigator.storage.persist()` requested but not OS-guaranteed |
| Triage result feels generic | Rule-based, not a trained clinical model | By design — conservative, explainable, and safe rather than a black-box diagnosis |
| App does not diagnose cancer | Intentional | Flags warning signs only; always routes to a real clinic/PHC for testing |
| Service worker not updating | Browser caching old version | Bump `CACHE_VERSION` in `sw.js` and hard-refresh |

### Security reporting
This project has no backend, user accounts, or transmitted data, which significantly limits its attack surface. If you discover a security or privacy issue (e.g., a way personal data could leak off-device, or an XSS vector in user-entered text), please report it privately rather than opening a public issue:

- Email: `[team-security-contact]@example.com`
- Please include: steps to reproduce, affected file/line, and potential impact.
- We aim to acknowledge reports within 48 hours during the hackathon window.

---

## 6. Governance & License

### Contributing
This project was built for ASYNC'26. Contributions, forks, and suggestions are welcome post-hackathon:
1. Fork the repo and create a feature branch (`git checkout -b feature/your-feature`)
2. Follow the existing code style (vanilla JS, 2-space indentation, one translation dictionary per language, one knowledge-base entry per condition)
3. Run the QA checklist in `/docs/qa-checklist.md` before opening a PR
4. Open a PR with a clear description of the change and which language(s)/screens were tested

### Code style
- No frameworks/build tools — keep it a single self-contained `index.html` unless a change is explicitly approved to modify that architecture
- All user-facing strings must be added to **all three** language dictionaries in the same commit
- All new symptoms/conditions must follow the existing knowledge-base schema (weights, severity, per-language content)

### License
This project is released under the [MIT License](LICENSE) — free to use, modify, and distribute, including for continued rural healthcare deployment beyond the hackathon.

### Disclaimer
Dr SAIhib provides general AI-generated health guidance only. It does not diagnose, prescribe, or replace a licensed medical professional. In any emergency, always call **108** or go to the nearest hospital immediately.

---

**Team ASYNC'26** · Built with  for rural India
