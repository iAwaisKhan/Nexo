# Security policy

## Reporting a vulnerability

Please do not open a public issue for a suspected vulnerability. Report it privately through the
GitHub repository's security advisory feature and include reproduction steps, affected routes or
data, and the expected impact.

## Supported version

The latest commit on `main` is the supported development version. This portfolio project does not
currently publish long-term-support releases.

## Security expectations

- Secrets belong in local or deployment environment variables and must never enter Git history.
- Public browser variables are limited to intentionally public client configuration.
- Cloud records require owner authorization; public sharing must use a narrow read-only endpoint.
- Dependency audit, lint, type checking, tests, and production build run in CI.
- Authentication tokens must not be stored in application-readable cookies when the Express API is
  introduced; refresh credentials will use secure HTTP-only cookies.
