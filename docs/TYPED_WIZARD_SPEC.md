# Typed Wizard Specification

## Purpose

The Typed Wizard extends the Project Genesis wizard model so that each field describes not only its key and label, but also the type of user interaction required.

This allows the Interactive Runner to automatically choose the correct prompt behavior.

---

# Current Field Types

Version 1 supports:

- string
- multiline

These are collected as text.

---

# Planned Field Types

The wizard will support:

```text
string
multiline
boolean
select
```

Future versions may support:

```text
password
number
multiselect
directory
file
date
email
url
```

---

# Prompt Selection

The Interactive Runner will automatically select the correct prompt.

Example:

```text
type: string
```

↓

```text
Project Name:
```

---

```text
type: multiline
```

↓

```text
Project Description
(enter one line for now):
```

---

```text
type: boolean
```

↓

```text
Use Docker?

1) Yes
2) No
```

---

```text
type: select
```

↓

```text
Database

1) PostgreSQL
2) SQLite
3) SQL Server
```

---

# Runner Responsibilities

The WizardRunner chooses the prompt based on field type.

The PromptProvider displays the prompt.

Neither component should contain template-specific logic.

---

# Validation

String

- Required
- Optional

Boolean

- Must resolve to true or false

Select

- Must match one available option

---

# Future Visibility Rules

Fields may eventually include rules such as:

```json
{
    "visibleWhen": {
        "USE_DATABASE": "true"
    }
}
```

This allows later fields to be skipped automatically.

---

# Design Goals

The Typed Wizard should:

- eliminate magic strings
- reduce user typing
- reduce invalid answers
- keep PromptProvider reusable
- keep WizardRunner orchestration-focused

---

# Backward Compatibility

Existing templates using:

```json
"type": "string"
```

or

```json
"type": "multiline"
```

continue to work without modification.

Typed prompts extend the model rather than replacing it.

# Current Implementation Status

Project Genesis currently supports four wizard field types:

- `string`
- `multiline`
- `boolean`
- `select`

Boolean fields display a Yes/No prompt and store:

```text
true
false

Wizard fields may optionally define a `visibleWhen` rule.

Example:

```json
{
  "key": "DATABASE",
  "label": "Database",
  "type": "select",
  "required": true,
  "visibleWhen": {
    "variable": "USE_DATABASE",
    "equals": "true"
  }
}

```md
Wizard fields may define an optional `visibleWhen` rule.

Fields are evaluated in declared order using answers already collected.

Hidden fields are not prompted and produce no `WizardAnswer`.