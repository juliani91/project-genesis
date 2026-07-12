# Template Catalog Specification

## Purpose

The Template Catalog provides a discoverable view of all available Project Genesis templates.

Instead of requiring users to know template identifiers, the catalog presents templates using descriptive metadata.

---

# Design Goals

The catalog should:

- Discover templates automatically
- Display human-friendly information
- Support filtering and searching
- Support sorting
- Preserve backward compatibility
- Scale to large template collections

---

# Catalog Entry

Each template contributes one catalog entry.

Example:

Name

```
Next.js API
```

Category

```
Web
```

Description

```
Builds a production-ready Next.js REST API.
```

Tags

```
nextjs
react
typescript
api
```

Version

```
1.0.0
```

Author

```
Project Genesis
```

---

# Sorting

Default sorting:

1. Category
2. Name

Future sorting:

- Recently updated
- Popularity
- Favorites
- Version

---

# Filtering

Examples:

Category

```
Web
```

Tags

```
typescript
```

Author

```
Project Genesis
```

---

# Search

Search should match:

- Name
- Description
- Tags

---

# CLI Presentation

Example:

Available Templates

1. Next.js API
   Category: Web

2. FastAPI
   Category: Python

3. Unity Game
   Category: Game Development

---

# Future Enhancements

- Ratings
- Favorites
- Template screenshots
- Online template registry
- Recommended templates
- Template dependencies

---

# Backward Compatibility

Templates that do not provide catalog metadata remain discoverable.

Reasonable defaults should be used whenever metadata is missing.

# Current Implementation Status

Project Genesis currently builds its template catalog from discovered template manifests.

The catalog normalizes optional metadata:

```text
Missing category → Uncategorized
Missing tags     → Empty list
Missing parent   → No parent