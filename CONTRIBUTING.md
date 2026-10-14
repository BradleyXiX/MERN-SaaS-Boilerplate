# Contributing to SaaS Pro

Guidelines and engineering standards for contributing code, architecture designs, and documentation to the SaaS Pro platform.

---

## 1. Engineering Directives & Core Contract

All contributions must adhere strictly to the engineering standards codified in [`.agents/AGENTS.md`](file:///c:/Users/Admin/OneDrive/Desktop/Source%20Code/MERN%20SaaS%20Boiler-Plate/.agents/AGENTS.md):

1. **Zero Placeholders**: Never commit `// TODO`, `/* Implement later */`, or incomplete stubs in production paths.
2. **Runtime Validation Boundaries**: Every API endpoint and mutation must be gated by strict runtime schemas using Zod.
3. **Defensive Security**: No tokens stored in `localStorage` or `sessionStorage`. All authentication state resides in `HttpOnly`, `Secure`, `SameSite=Strict` cookies.
4. **RFC 7807 Standard Errors**: All API failures return structured `application/problem+json` envelopes.
5. **Aesthetic Integrity**: Visual surfaces must follow the Obsidian Bento design system (`#090B10`, `#0F131C`, hairline borders, `Outfit`/`Plus Jakarta Sans`/`JetBrains Mono`). Avoid generic AI templates.
6. **Diátaxis Documentation**: All documentation additions must belong to exactly one Diátaxis quadrant (Tutorial, How-To, Reference, Explanation).

---

## 2. Git Workflow & Semantic Commits

### Branch Naming Conventions

```
feature/<feature-name>       # New capabilities (e.g. feature/sso-saml)
bugfix/<issue-description>   # Bug fixes (e.g. bugfix/rate-limit-drift)
docs/<documentation-topic>   # Documentation updates (e.g. docs/diataxis-overhaul)
refactor/<subsystem-name>    # Code refactoring without behavior change
```

### Commit Message Standard (Conventional Commits)

Commit messages must use imperative active voice and follow standard semantic prefixes:

```
feat(auth): add passkey WebAuthn registration endpoint
fix(cookie): resolve SameSite strict partition during cross-subdomain redirect
docs(api): document RFC 7807 problem details error responses
test(client): add Vitest unit tests for session expiration listener
perf(webgl): clamp canvas DPR to 1.8 to reduce GPU fill-rate on mobile
```

---

## 3. Pre-Pull Request Checklist

Before submitting a Pull Request, verify every item:

- [ ] **Tests Passing**:
  ```bash
  # Client Vitest suite
  npm test --prefix client -- --run
  # Server Jest suite
  npm test --prefix server -- --runInBand
  ```
- [ ] **Build Validation**:
  ```bash
  npm run build --prefix client
  ```
- [ ] **Zero Hardcoded Secrets**: Audit for stray API keys or tokens; ensure all secrets use environment variables defined in `.env.example`.
- [ ] **Documentation**: Updated or created corresponding Diátaxis documents in `docs/` or ADRs in `docs/adr/`.
- [ ] **Clean Lint**: No ESLint or formatting errors.

---

## 4. Code Review Criteria

Reviewers evaluate submissions against:
- **Architecture Safety**: Are database queries parameterized and sanitized via `mongo-sanitize`?
- **Resource Cleanup**: Do React hooks, Three.js canvases, and GSAP timelines implement explicit disposal on unmount?
- **Performance Budgets**: Does frontend code avoid layout thrashing and maintain 60fps / 120fps?
- **Error Transparency**: Are error messages actionable, structured, and free of sensitive internal stack traces in production?
