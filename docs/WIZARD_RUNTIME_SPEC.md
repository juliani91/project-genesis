# Wizard Runtime Specification

## Purpose

The Wizard Runtime executes a wizard definition and produces a completed Wizard Session.

The runtime does not generate projects.

The runtime does not evaluate generation rules.

Its sole responsibility is collecting answers.

---

# Architecture

wizard.json

↓

Wizard

↓

WizardRuntime

↓

WizardSession

↓

VariableCollection

↓

Generation

---

# Responsibilities

The Wizard Runtime:

- Executes wizard steps
- Collects answers
- Validates required fields
- Produces a Wizard Session

---

# Non-Responsibilities

The Wizard Runtime must not:

- Render templates
- Generate files
- Evaluate generation rules
- Write to disk
- Modify template packages

---

# Wizard Session

A Wizard Session represents one completed execution of a wizard.

The wizard remains immutable.

Each execution creates a new session.

---

# Wizard Answers

Every answer belongs to exactly one wizard field.

Example:

PROJECT_NAME

↓

Inventory Application

Example:

USE_DOCKER

↓

true

---

# Runtime Flow

Wizard

↓

Display Step

↓

Collect Answers

↓

Validate

↓

Wizard Session

---

# Variable Generation

The Wizard Runtime does not create a VariableCollection.

That responsibility belongs to the VariableCollectionBuilder.

This separation allows:

- computed variables
- default values
- derived variables
- AI-generated values

without modifying the runtime.

---

# Future Capabilities

Future versions may support:

- Command-line execution
- Web UI
- Desktop UI
- Saved sessions
- Wizard replay
- AI-assisted answers
- Default answer providers
- Remote wizard execution