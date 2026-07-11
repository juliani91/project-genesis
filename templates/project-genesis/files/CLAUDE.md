# CLAUDE.md

## Project Fields

- Project name: {{PROJECT_NAME}}
- Client name: {{CLIENT_NAME}}
- Project description: {{PROJECT_DESCRIPTION}}
- Tech stack: {{TECH_STACK}}
- Created date: {{CREATED_DATE}}

## Operating Model

This project follows the Architect / Builder methodology.

- The Architect defines requirements, blueprints, acceptance criteria, and handoff prompts.
- The Builder executes from written artifacts.
- The repository is the durable source of truth.

## First Files to Read

1. `CLAUDE.md`
2. `Planning/STATE.md`
3. `Planning/DECISIONS.md`
4. `Planning/DOMAIN.md`
5. `Planning/RISKS.md`
6. `Planning/QUESTIONS.md`
7. Active sprint files under `Planning/Sprints/`
8. Relevant documents under `Docs/`

## Builder Rules

- Do not redefine scope.
- Do not invent business rules.
- Record unanswered questions in `Planning/QUESTIONS.md`.
- Do not overwrite files without approval.
- Do not store credentials or secrets.
- Update `Planning/STATE.md` when project status changes.
- Update `Planning/DECISIONS.md` when decisions are made.