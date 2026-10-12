---
name: technical-documentation
description: Enforce the Diátaxis documentation framework, Architecture Decision Records (ADRs) with Mermaid.js diagrams and trade-off matrices, active voice, and zero conversational filler.
---

# Technical Documentation & Architecture Decision Records (ADR)

## Core Directives

Documentation is an engineering deliverable subject to the same rigor, clarity, and precision as production source code. Ambiguity, conversational fluff, and mixed pedagogical goals degrade knowledge transfer and create engineering bottlenecks.

This skill governs:
1. **The Diátaxis Documentation Framework**: Clean separation into Tutorials, How-To Guides, Reference, and Explanation.
2. **Architecture Decision Records (ADR)**: Structured historical logs of technical choices, complete with trade-off matrices and Mermaid diagrams.
3. **Voice, Tone & Style**: Direct active voice, concise phrasing, and zero conversational filler ("Certainly!", "Now let's delve into...").

---

## 1. The Diátaxis Documentation Framework

Every technical document written must belong to exactly one of the four Diátaxis quadrants:

| Quadrant | Primary Orientation | Target User State | Document Structure & Style |
|---|---|---|---|
| **Tutorial** | **Learning-oriented** | Beginner acquiring competence | Step-by-step guidance building a working project from scratch. No tangents or deep theoretical explanations. |
| **How-To Guide** | **Task-oriented** | Practitioner solving a real-world problem | Direct recipes starting with a goal and listing sequential steps to achieve that specific outcome. |
| **Reference** | **Information-oriented** | Developer needing precise facts | Schemas, API signatures, CLI arguments, environment variable tables, constraints. Fact-dense and neutral. |
| **Explanation** | **Understanding-oriented** | Engineer evaluating architecture | Discussions of context, design trade-offs, historical evolution, and system trade-offs. |

---

## 2. Architecture Decision Records (ADR) Standard

When introducing a new subsystem, library, database engine, or refactoring paradigm, author an ADR in `docs/adr/` using this specification:

### ADR Template
```markdown
# ADR-004: Adoption of Redis Sliding Window for API Gateway Rate Limiting

- **Status**: Accepted
- **Deciders**: Principal Platform Architect, Security Lead
- **Date**: 2026-10-12
- **Technical Story**: Mitigate credential stuffing on auth endpoints while keeping p99 gateway overhead under 5ms.

## Context & Problem Statement
Our public authentication endpoints (/api/v1/auth/login) were experiencing periodic brute-force bursts. In-memory rate limiters failed because traffic is distributed across four stateless Node.js containers, allowing distributed attackers to bypass single-instance memory thresholds.

## Decision Drivers
- Distributed consistency across all application replicas.
- P99 latency impact under 5ms per evaluated request.
- Automatic key expiration without scheduled garbage collection sweeps.
- Zero client disruption under normal traffic volumes.

## Considered Options
1. Redis Sorted Set Sliding Window
2. Token Bucket in PostgreSQL
3. Cloudflare Enterprise Edge Rate Limiting

## Evaluation & Trade-Off Matrix

| Criterion | Option 1: Redis Sliding Window | Option 2: Postgres Token Bucket | Option 3: Cloudflare Edge |
|---|---|---|---|
| **P99 Latency Overhead** | **1.8ms** (Optimal) | 18.4ms (High contention) | 0ms (Handled before origin) |
| **Operational Overhead** | Low (Existing Redis cluster) | Medium (Extra table locks) | High (Vendor lock-in & costs) |
| **Accuracy / Drift** | 100% exact time sliding | Exact | Coarse-grained sampling |
| **Cost Impact** | $0 additional infrastructure | Increased DB IOPS | $2,000/mo enterprise plan |

## Decision Outcome
Chosen option: **Option 1: Redis Sorted Set Sliding Window**, because it leverages our existing Redis infrastructure, guarantees exact window accuracy, and maintains sub-2ms latency overhead.

## Architecture Diagram

\`\`\`mermaid
sequenceDiagram
    autonumber
    actor Client
    participant Gateway as API Gateway (Node)
    participant Redis as Redis Cache Cluster
    participant Auth as Auth Service

    Client->>Gateway: POST /api/v1/auth/login
    Gateway->>Redis: ZADD & ZREMRANGEBYSCORE (atomic script)
    Redis-->>Gateway: Current Request Count
    alt Count > Threshold (5 req/15min)
        Gateway-->>Client: 429 Too Many Requests (RFC 7807)
    else Count <= Threshold
        Gateway->>Auth: Process Authentication
        Auth-->>Gateway: Session Cookie
        Gateway-->>Client: 200 OK
    end
\`\`\`

## Consequences
- **Positive**: Distributed protection active across all replica nodes; zero table locks on PostgreSQL.
- **Negative**: Adds hard dependency on Redis uptime for authentication paths (mitigated via fail-open circuit breaker in gateway).
```

---

## 3. Style Guidelines: Active Voice & Anti-Filler Rules

Technical documentation must communicate facts with maximum information density.

### Forbidden vs. Required Phrasing

| Anti-Pattern (Conversational Filler) | Production Standard (Direct & Active) |
|---|---|
| *"In this section, we will delve into the exciting concept of session cookies and explore why they are useful."* | *"Session cookies authenticate user requests across protected HTTP endpoints."* |
| *"You might want to make sure that you don't forget to set the environment variable."* | *"Set `DATABASE_URL` in `.env` before booting the server."* |
| *"As you can see from the diagram above, the client talks to the gateway."* | *"The client transmits requests directly to the API Gateway."* |
| *"Feel free to reach out or customize this according to your own unique needs!"* | *"Configure `max_connections` in `database.json` to adjust pool limits."* |

### Structural Writing Checklist
- Start action-oriented steps with imperative verbs (*Deploy*, *Verify*, *Configure*, *Query*).
- Put prerequisites and requirements in callouts at the top of the guide.
- Include expected output for every command block.
- Keep sentences concise. Use bulleted lists and tables for multi-attribute comparisons.
