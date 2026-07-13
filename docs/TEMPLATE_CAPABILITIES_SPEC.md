# Template Capabilities Specification

## Purpose

Template Capabilities describe what a template provides, what it requires, and what it conflicts with.

The composition engine validates compatibility before generation begins.

---

# Capabilities

Capabilities describe technologies or features supplied by a template.

Examples

```
node

typescript

react

docker

postgres

testing
```

---

# Required Capabilities

Templates may require capabilities provided by other templates.

Example

```
Playwright

requires

node

typescript
```

---

# Conflicting Capabilities

Templates may declare capabilities that cannot coexist.

Example

```
SQLite

conflicts

postgres
```

---

# Validation

A composition is valid when:

- all required capabilities are available
- no conflicting capabilities exist

---

# Future Enhancements

- Capability versions
- Optional capabilities
- Soft recommendations
- Automatic feature suggestions
- Marketplace compatibility
- Online capability registry

---

# Examples

Valid

```
Next.js

provides

node
typescript
react

+

Playwright

requires

node
typescript
```

Invalid

```
C++

+

Playwright
```

Missing

```
node

typescript
```

---

# Design Goals

- Declarative
- Extensible
- Technology agnostic
- No hardcoded template combinations
- Compatible with composition
- Easy to validate

---

# Backward Compatibility

Templates without capability metadata remain valid.

They simply provide no explicit capabilities.