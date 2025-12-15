# Changelog

All notable changes to this project will be documented in this file.

## [2025-12-14] - Project Analysis & Initialization
### Added
- Created Memory Bank documentation structure (`projectbrief.md`, `productContext.md`, `systemPatterns.md`, `techContext.md`, `activeContext.md`, `progress.md`).
- Created `docs/tasktracker.md`.
- Created `docs/project.md` template.

### Changed
- **Refactoring**: Split monolithic `App.tsx` into:
    - Custom Hooks: `useEvents`, `useAI`, `useTheme`, `useReminders`.
    - Components: `Navigation`, `Header`, `MobileActions`.
- **Dependencies**: Fixed `@google/genai` versioning issues (switched to `*` wildcard) and installed `typescript` properly.
- **Architecture**: Moved core logic to `src/hooks`.

## [2025-12-15] - Continuous Improvement (Batch 1)
### Added
- **Drag & Drop**: Implemented Calendar Drag & Drop using `@dnd-kit`.
- **Event Colors & Categories**: Added `color` and `category` support to `CalendarEvent`.
- **UI**: Added Color/Category pickers to `CreateEventModal` and indicators to `EventList`.

## [2025-12-15] - Continuous Improvement (Batch 2)
### Added
- **Advanced AI Providers**: Added support for **Algion** (GPT-4o free) and **OpenRouter APIs**.
- **Settings UI**: Added interface to switch between AI providers and input API keys.
- **Service Layer**: Refactored `services/ai.ts` to support multiple backends.

## [2025-12-15] - Continuous Improvement (Batch 3)
### Added
- **Voice Input**: Integrated Web Speech API for voice-to-text in Chat.
- **Smart Suggestions**: Added context-aware suggestion chips (e.g., "Plan lunch", "Review day") in Chat.
- **Interactions**: Passed event context to Chat UI for smarter local suggestions.
