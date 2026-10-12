---
name: api-reference
description: Mandate rigorous API reference documentation including concrete JSON schemas, authentication headers, complete HTTP status dictionaries, and copy-pasteable curl verification commands.
---

# API Reference Standards & Endpoint Documentation

## Core Directives

API reference documentation must serve as an authoritative, unambiguous contract between frontend clients, mobile consumers, third-party partners, and backend engineers. Incomplete examples, missing headers, or vague error descriptions are unacceptable.

Every endpoint documented must contain:
1. **HTTP Method & Absolute Route Path**.
2. **Authentication & Authorization Requirements** (Cookies, Bearer headers, RBAC roles).
3. **Complete Request Payload & Query Parameter Schema**.
4. **Concrete Response Payloads** for 2xx success and all standard non-2xx failure codes (400, 401, 403, 404, 422, 429, 500).
5. **A Copy-Pasteable, Working `curl` Snippet**.

---

## 1. Standard Endpoint Specification Template

Follow this exact Markdown format for every documented endpoint:

```markdown
### Create Tenant Project

Initializes an isolated project workspace within the authenticated user's organization tenant.

- **Method**: \`POST\`
- **Endpoint**: \`/api/v1/projects\`
- **Authentication**: Session Cookie (\`saas_auth_session\`) or Bearer Token
- **Required RBAC Role**: \`tenant_admin\` or \`member\`
- **Rate Limit**: 60 requests / minute

#### Headers
| Header | Required | Type | Description |
|---|---|---|---|
| \`Authorization\` | Conditional | String | \`Bearer <jwt_token>\` (if not using cookie session) |
| \`Content-Type\` | Yes | String | \`application/json\` |
| \`Idempotency-Key\` | Optional | UUID | Prevents duplicate project creation on network retry |

#### Request Body Schema (JSON)
| Field | Type | Required | Constraints | Description |
|---|---|---|---|---|
| \`name\` | string | Yes | 3–64 chars | Project display title |
| \`slug\` | string | Yes | Lowercase alphanumeric + hyphens | Unique URL slug |
| \`region\` | string | No | Enum: \`us-east\`, \`eu-central\`, \`ap-southeast\` | Default: \`us-east\` |
| \`tags\` | string[] | No | Max 10 items | Filtering metadata tags |

##### Example Request Payload
\`\`\`json
{
  "name": "Production Telemetry Pipeline",
  "slug": "prod-telemetry",
  "region": "us-east",
  "tags": ["monitoring", "high-priority"]
}
\`\`\`

#### Responses

##### 201 Created
Returns the fully provisioned project entity with timestamps and internal identifiers.
\`\`\`json
{
  "data": {
    "id": "proj_9f82b7c4a1e3",
    "tenantId": "org_7b31a2c9",
    "name": "Production Telemetry Pipeline",
    "slug": "prod-telemetry",
    "region": "us-east",
    "status": "active",
    "tags": ["monitoring", "high-priority"],
    "createdAt": "2026-10-12T15:30:00.000Z",
    "updatedAt": "2026-10-12T15:30:00.000Z"
  }
}
\`\`\`

##### 400 Bad Request
Occurs when the request body is malformed or invalid JSON.
\`\`\`json
{
  "type": "https://api.example.com/errors/bad-request",
  "title": "Bad Request",
  "status": 400,
  "detail": "Failed to parse JSON body at line 1 column 12.",
  "instance": "/api/v1/projects"
}
\`\`\`

##### 401 Unauthorized
Occurs when no valid session cookie or Authorization header is provided.
\`\`\`json
{
  "type": "https://api.example.com/errors/unauthorized",
  "title": "Unauthorized",
  "status": 401,
  "detail": "Authentication credentials are missing or expired.",
  "instance": "/api/v1/projects"
}
\`\`\`

##### 403 Forbidden
Occurs when an authenticated user possesses insufficient RBAC permissions.
\`\`\`json
{
  "type": "https://api.example.com/errors/forbidden",
  "title": "Forbidden",
  "status": 403,
  "detail": "Role 'viewer' cannot create projects in this organization.",
  "instance": "/api/v1/projects"
}
\`\`\`

##### 422 Unprocessable Entity
Occurs when parameters fail Zod runtime validation constraints.
\`\`\`json
{
  "type": "https://api.example.com/errors/validation-failed",
  "title": "Unprocessable Entity",
  "status": 422,
  "detail": "Validation error for 'slug'.",
  "instance": "/api/v1/projects",
  "invalidParams": [
    {
      "field": "slug",
      "message": "Slug must contain only lowercase letters, numbers, and hyphens",
      "code": "invalid_string"
    }
  ]
}
\`\`\`

##### 429 Too Many Requests
Triggered when the client breaches configured rate limits.
\`\`\`json
{
  "type": "https://api.example.com/errors/rate-limit-exceeded",
  "title": "Too Many Requests",
  "status": 429,
  "detail": "Request threshold exceeded. Retry allowed in 28 seconds.",
  "instance": "/api/v1/projects"
}
\`\`\`

##### 500 Internal Server Error
Unhandled internal infrastructure exception.
\`\`\`json
{
  "type": "https://api.example.com/errors/internal-server-error",
  "title": "Internal Server Error",
  "status": 500,
  "detail": "An unexpected error occurred while processing your request.",
  "instance": "/api/v1/projects"
}
\`\`\`

#### Verification Command (`curl`)
\`\`\`bash
curl -X POST "https://api.example.com/api/v1/projects" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer test_jwt_token_sample" \
  -H "Idempotency-Key: 11111111-2222-3333-4444-555555555555" \
  -d '{
    "name": "Production Telemetry Pipeline",
    "slug": "prod-telemetry",
    "region": "us-east",
    "tags": ["monitoring", "high-priority"]
  }'
\`\`\`
```

---

## 2. API Route Inspection Checklist

When documenting or reviewing routes in the codebase:
- [ ] Ensure route parameters (`:id`, `:slug`) match the documented param names.
- [ ] Confirm query string parsing handles pagination defaults (`page=1&limit=20`, `max=100`).
- [ ] Verify sensitive fields (passwords, hashed secrets, raw keys) are omitted from response schemas.
- [ ] Confirm the exact HTTP status code matches REST conventions (`200 OK`, `201 Created`, `204 No Content`).
