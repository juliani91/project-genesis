# Conditional Wizard Specification

## Purpose

Conditional Wizard Flow allows Project Genesis to show or skip wizard fields based on answers collected earlier in the same wizard session.

This makes the wizard adaptive and prevents users from answering questions that are not relevant to their selected configuration.

---

# Example

A database selection field may be visible only when database support is enabled.

```json
{
  "key": "DATABASE",
  "label": "Database",
  "type": "select",
  "required": true,
  "visibleWhen": {
    "variable": "USE_DATABASE",
    "equals": "true"
  },
  "options": [
    {
      "label": "PostgreSQL",
      "value": "postgres"
    },
    {
      "label": "SQLite",
      "value": "sqlite"
    },
    {
      "label": "SQL Server",
      "value": "sqlserver"
    }
  ]
}
```

When:

```text
USE_DATABASE = "true"
```

the field is shown.

When:

```text
USE_DATABASE = "false"
```

the field is skipped.

---

# Rule Format

Version 1 supports one equality-based visibility rule.

```json
{
  "variable": "USE_DATABASE",
  "equals": "true"
}
```

The rule contains:

- `variable`: the key of a previously answered wizard field
- `equals`: the value required for the field to be visible

---

# Visibility Behavior

A field without `visibleWhen` is always visible.

A field with `visibleWhen` is visible only when the referenced answer exists and equals the expected value.

If the referenced answer does not exist, the field is hidden.

---

# Evaluation Timing

Visibility is evaluated immediately before prompting a field.

This means only answers collected earlier in the wizard may be used reliably.

Templates should not reference fields that appear later in the wizard.

---

# Hidden Fields

Hidden fields:

- are not prompted
- do not create a `WizardAnswer`
- do not participate in required-answer validation
- do not create variables in the `VariableCollection`

---

# Required Fields

A required field is required only when it is visible.

A hidden required field must not produce a missing-answer validation error.

---

# Runner Responsibilities

The `WizardRunner` is responsible for:

- tracking answers collected so far
- evaluating field visibility before prompting
- skipping hidden fields
- preserving the original field order

---

# Evaluator Responsibilities

The visibility evaluator is responsible for:

- reading a field visibility rule
- finding the referenced answer
- comparing the answer value
- returning `true` or `false`

The evaluator must not prompt users or modify answers.

---

# Validation

Conditional wizard validation should detect:

- empty visibility variable keys
- empty expected values
- references to unknown wizard field keys
- references to the same field
- references to fields that appear later in the wizard

---

# Design Principles

Conditional Wizard Flow must be:

- deterministic
- JSON-based
- independent of the console
- reusable by future web and desktop interfaces
- evaluated from collected answers only
- compatible with existing wizards

---

# Backward Compatibility

Existing fields without `visibleWhen` continue to behave exactly as before.

No existing wizard template changes are required unless conditional flow is desired.

---

# Future Capabilities

Future versions may support:

- multiple visibility rules
- AND and OR groups
- negation
- nested conditions
- comparison operators
- option-dependent help text
- conditional wizard steps
- default values for hidden fields

# Current Implementation Status

Project Genesis currently supports one equality-based visibility rule per wizard field.

Example:

```json
{
  "visibleWhen": {
    "variable": "USE_DATABASE",
    "equals": "true"
  }
}