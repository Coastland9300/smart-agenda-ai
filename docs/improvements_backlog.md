# Backlog of Improvements (Goal: 100)

## 🧠 AI & Smart Features
1.  **AI Context Awareness**: Teach AI to understand "next Monday" relative to current date properly in complex sentences.
2.  **Voice Input**: Add speech-to-text button for creating events.
3.  **Smart Suggestions**: AI suggests best time for new events based on free slots.
4.  **Habit Tracking**: AI suggests times for habits if missed.
5.  **Meeting Summary**: Paste meeting notes and let AI extract action items (events).
6.  **Conflict Detection**: AI warns if a new event overlaps with existing ones.
7.  **Auto-Tagging**: AI automatically assigns colors/tags based on keywords (e.g., "Gym" -> Red).
8.  **Natural Language Search**: "Find when I went to the dentist last".
9.  **Recurring Rules**: Support "Every 2nd Tuesday of the month".
10. **Voice Assistant Mode**: Full voice conversation mode.

## 🎨 UI/UX Polish
11. **Drag & Drop**: Move events in Calendar View.
12. **Swipe Actions**: Swipe event in list to delete/complete.
13. **Haptic Feedback**: Vibration on click/success (Mobile).
14. **Sound Effects**: Subtle sounds for messages/completion.
15. **Event Colors**: Allow custom color selection for events.
16. **Themes Library**: More preset themes (Midnight, Forest, Sunset).
17. **Custom Wallpaper**: User uploaded background for chat.
18. **Compact Mode**: Denser list view for power users.
19. **Skeleton Loading**: Better loading states instead of spinners.
20. **Scroll Snap**: Smooth scrolling for calendar months.

## 📱 PWA & Mobile
21. **Offline Mode**: Full offline read/write support (verify Dexie sync).
22. **Install Prompt**: Custom "Add to Home Screen" UI.
23. **Share Target**: Receive text from other apps to create events.
24. **Push Notifications**: Real push notifications (via Service Worker) instead of just browser alerts.
25. **App Icon Badge**: Show number of incomplete tasks on icon.
26. **Widgets**: (If possible via PWA or OS integration) Home screen widget.
27. **Quick Actions**: Force touch / long press icon actions.

## ⚙️ Functionality
28. **Categories/Tags**: Manually tag events.
29. **Subtasks**: Add checklist to an event.
30. **Attachments**: Attach images/files to events.
31. **Search**: Keyword search for events.
32. **Filters**: Filter by category/completion.
33. **Analytics**: Charts showing time distribution (Work vs Life).
34. **Pomodoro Timer**: focus timer linked to tasks.
35. **Multi-day Events**: Better visualization efficiently.
36. **Trash Bin**: Recover deleted events (soft delete).
37. **Undo/Redo**: Cmd+Z support.
38. **Print View**: Printer-friendly CSS.

## 🛠 Technical
39. **Sync**: Sync between devices (requires backend/peer-to-peer).
40. **Auth**: User accounts (optional).
41. **Performance**: Virtualized list for thousands of events.
42. **Lazy Loading**: Code splitting for Chat/Calendar.
43. **Error Boundary**: Graceful crash handling.
44. **Logging**: Internal logs for debugging.
45. **E2E Testing**: Playwright/Cypress flows.

## 🚀 Productivity & Gamification
46. **Keyboard Shortcuts**: Hotkeys for creating events (C), Chat (K), Today (T).
47. **Markdown Support**: Rich text in event descriptions/notes.
48. **Priority Levels**: Visual distinction for High/Medium/Low priority.
49. **"Energy" Tags**: Tag tasks by required energy (High/Low) for better scheduling.
50. **Gamification (XP)**: Earn XP for completing tasks, level up system.
51. **Streaks**: Visual counter of consecutive productive days.
52. **Badges**: Achievements for consistency (e.g., "Early Bird").
53. **Confetti**: Animation on completing major tasks.
54. **Focus Mode**: Hide all UI except the current task/timer.
55. **Daily Briefing**: AI summary of the day at 8:00 AM.
56. **"Burnout Warning"**: AI warns if schedule is too packed for too long.
57. **Zen Mode**: Minimalist interface showing only the *next* event.

## 🌐 Integrations & Data
58. **iCal Export**: Download schedule as `.ics`.
59. **iCal Import**: Parse `.ics` files.
60. **Google Calendar Sync**: Two-way sync (requires API auth).
61. **Weather Widget**: Show forecast for the day in header.
62. **Time Zones**: Support for events in different time zones.
63. **WebDAV Support**: Sync via Nextcloud/WebDAV.
64. **Backup Automation**: Auto-save JSON to local storage/download weekly.
65. **Data Encryption**: Encrypt sensitive notes locally.
66. **Print Styles**: Optimized CSS for printing the agenda.
67. **Share Event**: Generate a text/image summary to share.

## ♿ Accessibility & Localization
68. **Screen Reader Support**: ARIA labels for all interactive elements.
69. **Keyboard Navigation**: Full focus management without mouse.
70. **High Contrast Theme**: For better visibility.
71. **Font Sizing**: User-adjustable base font size.
72. **Localization**: Toggle between RU/EN interfaces.
73. **24h/12h Toggle**: Time format preference.
74. **Start of Week**: Toggle Monday/Sunday start.

## 📱 Advanced Interactions
75. **Right-Click Menu**: Quick context actions (Delete, Edit, Duplicate).
76. **Bulk Actions**: Select multiple events to delete/move.
77. **Duplicate Event**: Clone an event with one click.
78. **Recurring Exceptions**: Move one instance of a recurring event.
79. **Duration Drag**: Resize event height to change duration (Calendar View).
80. **"Someday" List**: Backlog for tasks without specific dates.
81. **Search Filters**: Advanced filtering (by color, tag, duration).
82. **Undo/Redo**: Global history stack for actions.
83. **Trash Bin**: Soft delete with restore option.

## 💡 Fun & Experimental
84. **Daily Quote**: AI-generated motivation or joke.
85. **Sentiment Analysis**: AI analyzes your diary entries for mood tracking.
86. **Life Balance Chart**: Visual pie chart of Event Categories (Work vs Life).
87. **Biometric Lock**: Privacy screen requiring FaceID/TouchID (Mobile).
88. **Custom Wallpapers**: Upload background image for the app.
89. **Sound Themes**: "Mechanical Keyboard" or "Soft UI" sound packs.
90. **"Time Travel"**: Visual history of past years.
91. **Onboarding Tour**: Interactive tutorial for new users.
92. **Changelog UI**: In-app pop-up showing new updates.
93. **Feedback Form**: Internal form to save user suggestions.
94. **Water Tracker**: Simple counter integrated into daily view.
95. **Habit Streaks**: Specific visualization for repeating habits.
96. **"Bored?" Button**: AI suggests a quick task from backlog.
97. **Smart Reschedule**: "Move all afternoon tasks to tomorrow".
98. **PDF Export**: Generate a beautiful PDF report of the week.
99. **Emoji Picker**: Native emoji picker for event titles.
100. **Credits/About**: Page listing libraries and version info.
