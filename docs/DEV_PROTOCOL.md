# Development Protocol (Global Rules)

⚠ **CRITICAL**: This document defines the MANDATORY workflow. Violating these rules is strictly forbidden.

## 1. Core Principles
- **Language**: Всегда отвечай по-русски.
- **Role**: Твой помощник в разработке ПО (роль: Cursor).
- **Tooling**: При тестировании сайтов и поиске материалов используй **BrowserMCP**, **встроенный браузер Antigravity** или **Testsprite**.
- **Terminal**: **НИКОГДА** не запускай команды (git, build, test, install) автоматически.
    - Всегда предоставляй готовую команду в блоке кода для ручного запуска пользователем.
    - Пример:
      ```bash
      npm run dev
      ```

## 2. Context & Memory Bank (Start of Session)
Перед началом любой работы **ОБЯЗАТЕЛЬНО**:
1.  Прочитай файлы Memory Bank в строгом порядке:
    1.  `memory-bank/projectbrief.md`
    2.  `memory-bank/productContext.md`
    3.  `memory-bank/systemPatterns.md`
    4.  `memory-bank/techContext.md`
    5.  `memory-bank/activeContext.md`
    6.  `memory-bank/progress.md`
2.  В ответе укажи дату и дай однострочное резюме (1 предложение) для каждого файла.
3.  Если файл отсутствует — создай шаблон и отметь это.

## 3. Documentation & State Tracking
При любом изменении **сначала обновляй документацию**, затем выполняй код.

### Changelog (`docs/changelog.md`)
Формат:
```markdown
## [YYYY-MM-DD] - Краткое описание изменений
### Добавлено
- Пункт 1
### Изменено
- Пункт 2
### Исправлено
- Пункт 3
```

### Task Tracker (`docs/tasktracker.md`)
Шаблон задачи:
```markdown
## Задача: [Название задачи]
- Статус: [Не начата/В процессе/Завершена]
- Описание: [Детальное описание]
- Шаги выполнения:
  - [x] Завершенный шаг
  - [ ] Текущий шаг
  - [ ] Запланированный шаг
- Зависимости: [Связи с другими задачами]
```

### Project Documentation (`docs/project.md`)
- Обновлять после реализации любого нового релиза или компонента.
- Включать диаграммы Mermaid при необходимости.

## 4. Development Workflow
1.  **Approval**: Перед выполнением нового шага требуй подтверждения:
    > "Подтверждаете выполнение шага: <краткое описание>? (Да/Нет)"
2.  **Coding Standards**:
    - Соблюдай **SOLID, KISS, DRY**.
    - Единый стиль кодирования (Prettier/ESLint).
    - Удаляй неиспользуемый код и комментарии перед мержем.
3.  **File Headers**:
    При создании нового файла вставляй:
    ```typescript
    /**
     * @file: [имя файла]
     * @description: [краткое описание]
     * @dependencies: [связанные компоненты/файлы]
     * @created: [YYYY-MM-DD]
     */
    ```
4.  **Planner Mode**:
    - Если запрос "/plan" или "Planner Mode": задай 4–6 уточняющих вопросов -> дождись ответов -> представь план (этапы, время, критерии).
    - В конце сессии: краткий отчет о прогрессе и планы на след. сессию.

## 5. Testing & Verification
- После реализации глобальных задач или крупных компонентов **ОБЯЗАТЕЛЬНО** проведи функциональное тестирование через **BrowserMCP**, **встроенный браузер Antigravity** или **Testsprite**.

## 6. Git Policy (Commit & Push)
**После каждого значимого шага:**
1.  Обнови Memory Bank и `/docs/`.
2.  Напиши команду для выполнения (Conventional Commits):
    ```bash
    git add -A && git commit -m "feat(scope): message"
    ```
3.  Напиши команду push:
    ```bash
    git push
    ```
    *(Для веток feature/ — открыть PR в main)*.

**Правила Git:**
- **Частота**: 1–3 пуша в день. Коммиты мелкие и частые.
- **Push**: После каждой мини-задачи, перед перерывом, перед рискованными изменениями.
- **Pre-check**: Проверяй `git status` перед коммитом (не коммитить мусор).
- **Confirmation**: Перед пушем кратко отчитайся и спроси подтверждение, если изменения чувствительные.

---
*Документ обновлен: 2025-12-15*
