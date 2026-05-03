---
description: "Design APIs that developers love to use"
application: "When designing REST APIs, endpoints, or reviewing API contracts"
applyTo: "**/*api*,**/*rest*,**/*endpoint*,**/*route*"
---

# API Design Principles

## Core Rules

1. **Nouns, not verbs**: `/users` not `/getUsers`
2. **Consistent naming**: Pick camelCase or snake_case
3. **Right status codes**: 200/201/204/400/401/403/404/429/500
4. **Versioning**: URL path preferred (`/v1/users`)

## Contract-First

Design the contract (OpenAPI) before implementation. Review with consumers.

## Error Format

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Human readable",
    "request_id": "req_123"
  }
}
```

## Checklist

- [ ] REST semantics (methods, status codes)
- [ ] Pagination on list endpoints
- [ ] Rate limits defined
- [ ] Consistent error format
- [ ] OpenAPI spec accurate
- [ ] Input validation at boundaries
- [ ] Auth on all non-public endpoints

## Pagination

```json
{
  "data": [],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "total": 142,
    "totalPages": 8
  }
}
```

## Anti-Patterns

- Verbs in URLs
- Breaking changes without version bump
- Exposing stack traces
- No rate limits
