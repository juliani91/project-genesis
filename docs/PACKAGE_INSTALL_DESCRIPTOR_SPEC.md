# Package Install Descriptor Specification

## Purpose

`packageInstall.json` describes how to install and verify the runtimes, packages, tools, and optional feature dependencies required by a generated project.

The descriptor is documentation metadata only.

Project Genesis does not execute install commands.

---

# Location

Templates may define:

```text
packageInstall.json
```

The descriptor is optional.

Templates without it remain valid.

---

# Output

When a selected base or feature template provides install metadata, Project Genesis generates:

```text
packageInstall.md
```

at the generated project root.

---

# Shape

```json
{
  "title": "Install {{PROJECT_NAME}}",
  "description": "Setup instructions.",
  "packageManager": "Recommended: pnpm.",
  "prerequisites": ["Node.js LTS installed"],
  "installSteps": [
    {
      "title": "Install dependencies",
      "description": "Install packages.",
      "commands": [
        {
          "label": "pnpm",
          "command": "pnpm install",
          "platform": "PowerShell"
        }
      ]
    }
  ],
  "runCommands": [],
  "verifyCommands": [],
  "environmentVariables": [],
  "notes": []
}
```

---

# Composition

Install metadata composes in template order:

```text
Base
Feature 1
Feature 2
Feature N
```

Rules:

- Base title, description, and package manager remain authoritative.
- Prerequisites and notes are deduplicated.
- Install, run, and verify commands are appended in order.
- Environment variables are deduplicated by key.
- The first environment variable definition wins.

---

# Authoring Rules

- Prefer PowerShell-friendly commands first.
- Include macOS/Linux alternatives when commands differ materially.
- Never include secrets.
- Use placeholders such as `{{PROJECT_NAME}}` only in renderable text.
- Keep commands safe and manual.
- Feature templates must not directly emit root-level `packageInstall.md`.
