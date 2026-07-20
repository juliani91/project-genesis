# Enterprise Features Specification

## Purpose

Enterprise features allow Project Genesis to model the governance layer around template registries, packages, and publishing workflows.

The enterprise layer does not replace the generation pipeline. It defines who can perform sensitive template ecosystem actions before those actions reach package, registry, or generation services.

---

# Scope

Current enterprise support includes:

- organizations
- members
- roles
- permissions
- policy checks
- registry scope
- audit summaries

Future releases may add:

- external identity providers
- remote registry authentication
- signed templates
- organization-owned registries
- persistent audit logs

---

# Organization

An organization is the governance boundary for one Project Genesis workspace.

It owns:

- role definitions
- member assignments
- registry scope
- policy decisions

---

# Roles and Permissions

Roles group permissions into reusable access levels.

Current built-in roles:

- Owner
- Maintainer
- Reviewer

Current permissions:

- `template:read`
- `template:publish`
- `registry:read`
- `registry:sync`
- `package:install`
- `package:remove`
- `organization:manage`

---

# Policy Checks

Policy checks answer one question:

```text
Can this member perform this permission?
```

Checks return:

- member ID
- permission
- allowed or denied
- reason

Expected failures are represented as policy results instead of thrown exceptions.

---

# Audit Events

Audit events summarize enterprise-relevant actions.

Current audit events are in-memory workspace summaries.

Future persistent audit storage should be implemented behind a service or loader so UI code does not perform direct persistence.

---

# Architecture

Enterprise models live under:

```text
lib/models/
```

Enterprise services live under:

```text
lib/services/
```

The UI receives serialized enterprise summaries from server-side service calls.

Client components may filter or present enterprise state, but they must not make authorization decisions.
