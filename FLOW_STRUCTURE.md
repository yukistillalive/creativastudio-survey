# App Flow & Structure Overview

## User Journey Flow

```
1. "/" (Home)
   └─> WelcomePage.jsx
       └─ User reads welcome message and clicks "Continue"

2. "/study" (Qualification)
   └─> Randomizor.jsx
       └─ Question 1: Professional field (must be Creative)
       └─ Question 2: Experience (must be 1+ year)
       └─ Question 3: GenAI familiarity (must have some experience)
       
       If disqualified → "/end" (EndPage.jsx)
       If qualified → "/survey" (Survey.jsx)

3. "/survey" (Embedded Survey)
   └─> Survey.jsx
       └─ Loads Google Form (A or B) embedded in an iframe
       └─ User completes survey without leaving the site
       └─ User can close window or form redirects when done

4. "/end" (End Page)
   └─> EndPage.jsx
       └─ Thank you message with auto-close countdown
```

## Directory Structure

```
src/
├── components/
│   ├── WelcomePage.jsx        ← Welcome screen
│   ├── Randomizor.jsx         ← Qualification questions
│   ├── Survey.jsx             ← Embedded Google Forms (NEW - moved from pages/)
│   ├── EndPage.jsx            ← End screen
│   ├── QuestionForm.jsx       ← Reusable question component
│   ├── LoadingSpinner.jsx     ← Loading indicator
│   ├── RedirectMessage.jsx    ← Redirect prompt
│   └── DebugPanel.jsx         ← Debug controls
│
├── config/
│   └── studyConfig.js         ← Centralized config (questions, forms, messages)
│
├── utils/
│   ├── abTesting.js           ← AB testing logic
│   └── security.js            ← Device fingerprinting & session management
│
├── App.jsx                    ← Main router (UPDATED with /survey route)
├── App.css
├── index.css
└── main.jsx
```

## Key Changes Made

### 1. Updated App.jsx
- Added `/survey` route
- Imports Survey component from `./components/Survey`

### 2. Updated Randomizor.jsx
- Changed redirect from external URL to `/survey`
- Users stay within the site instead of leaving

### 3. Created Survey.jsx in components/
- Integrated with AB testing system
- Checks localStorage for assigned test group
- Falls back to random assignment if needed
- Embeds forms in iframe (stays on-site)
- Shows loading state while determining form

### 4. Kept pages/ folder
- `pages/Survey.jsx` can be deleted (copy now in `components/`)
- OR keep both if needed for different purposes

## AB Testing Flow

```
1. User answers qualification questions
2. Randomizor.jsx checks AB testing manager
3. Manager assigns random group (A or B) - 50/50 split
4. Assignment stored in localStorage for consistency
5. User redirected to /survey
6. Survey.jsx retrieves assignment and loads correct form
7. User completes survey inside embedded iframe
```

## Configuration (studyConfig.js)

All settings in one place:
- Question text & options
- Form URLs for each group
- Welcome page content
- Messages & UI text
- Device exemptions
- Debug settings

## Testing URLs

- **Direct to form A**: `http://localhost:5173/survey?variant=A`
- **Direct to form B**: `http://localhost:5173/survey?variant=B`
- **Normal flow**: `http://localhost:5173/` → qualifications → form

## Next Steps

- Delete `/Users/yuki/Documents/GitHub/creativastudio-survey/src/pages/Survey.jsx` (optional - we have it in components/)
- Test the flow locally with `npm run dev`
- Check localStorage to verify AB group assignment
- Adjust form URLs in `config/studyConfig.js` if needed
