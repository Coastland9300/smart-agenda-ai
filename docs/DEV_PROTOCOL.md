# Development Protocol (STRICT ENFORCEMENT)

⚠ **AGENT REMINDER**: You MUST verify this checklist before every `notify_user` call.

## 1. Context & Safety
- [ ] **Read Memory Bank**: Did you check `activeContext.md`?
- [ ] **User Rules**: Are you strictly following `user_global` rules?
    - "Всегда отвечай по-русски."
    - "Команды Git выполняю ВРУЧНУЮ."

## 2. Documentation Sync (CRITICAL)
Before finishing a task, you **MUST** update:
1.  [ ] `memory-bank/activeContext.md`: What did you just do?
2.  [ ] `memory-bank/progress.md`: Did a phase/batch complete?
3.  [ ] `docs/changelog.md`: Record new features/fixes.
4.  [ ] `docs/tasktracker.md`: Mark steps as `[x]`.

## 3. Git Policy (MANDATORY)
You **MUST** provide a terminal block at the end of your response with the following commands:
```bash
git add .
git commit -m "<type>(<scope>): <short description>"
git push # Or 'git push origin main'
```

## 4. Final Sanity Check
- [ ] Did you accidentally break the build?
- [ ] Did you remove unused imports?
- [ ] Is the code clean and formatted?

---
*Signed: Smart Agenda AI Assistant*
