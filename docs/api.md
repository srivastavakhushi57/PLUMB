# PLUMB REST API Documentation

Base URL: `http://127.0.0.1:8000/api`  
Interactive Swagger Docs: `http://127.0.0.1:8000/docs`  
ReDoc Documentation: `http://127.0.0.1:8000/redoc`

---

## Authentication & Sessions (`/api/auth`)

All authenticated endpoints require an `Authorization: Bearer <token>` header.

### `POST /api/auth/login`
Authenticate a user with email and password or demo credentials.
- **Request Body**:
  ```json
  {
    "email": "admin@plumb.brand",
    "password": "any"
  }
  ```
- **Response** `200 OK`:
  ```json
  {
    "access_token": "jwt_token_string",
    "token_type": "bearer",
    "profile": {
      "id": "uuid",
      "org_id": "uuid",
      "full_name": "Eleanor Vance",
      "email": "admin@plumb.brand",
      "role": "admin",
      "is_external": false
    }
  }
  ```

### `GET /api/auth/me`
Retrieve profile of currently authenticated user.
- **Response** `200 OK`: Profile object.

### `GET /api/auth/demo-users`
List pre-seeded demo accounts for quick role-switching in the UI.

---

## Guidelines & Facts Management (`/api/guidelines`)

### `GET /api/guidelines/profile`
Retrieve active organization brand profile (voice, tone attributes, audience, do's, don'ts).

### `PUT /api/guidelines/profile` *(Admin only)*
Update the brand voice and guardrail attributes.

### `GET /api/guidelines/rules`
List all guideline rules. External agencies automatically receive only non-confidential rules (`is_confidential=False`).
- **Query Parameters**:
  - `category` (optional): `tone`, `terminology`, `messaging`, `legal`, `visual`, `accessibility`, `claims`
  - `active` (optional): `true` / `false`

### `POST /api/guidelines/rules` *(Admin only)*
Create a new guideline rule (version initialized to 1).

### `PUT /api/guidelines/rules/{rule_id}` *(Admin only)*
Update rule criteria, pattern config, or active status (increments version number).

### `DELETE /api/guidelines/rules/{rule_id}` *(Admin only)*
Deactivate / delete a guideline rule.

### `POST /api/guidelines/ingest-document` *(Admin only)*
Upload a guideline document (`.txt`, `.pdf`, `.docx`) to parse and generate proposed rules via AI. Proposed rules require admin review before becoming active.

### `GET /api/guidelines/facts`
List approved facts with validity dates and verification sources.

### `POST /api/guidelines/facts` *(Admin only)*
Create an approved ground-truth fact.

---

## Submissions & Versions (`/api/submissions`)

### `GET /api/submissions`
List submissions for the organization. Creators see their own; Reviewers and Admins see all.
- **Query Parameters**:
  - `status`: `draft`, `analysing`, `findings_ready`, `in_review`, `approved`, `rejected`, `changes_requested`
  - `channel`: `blog`, `social`, `email`, `ad`, `web`, `other`

### `POST /api/submissions`
Create a new draft submission and initial version 1.
- **Request Body**:
  ```json
  {
    "title": "Q3 Telemetry Launch Blog",
    "channel": "blog",
    "content_type": "text",
    "text_content": "Draft body text goes here..."
  }
  ```

### `GET /api/submissions/{submission_id}`
Retrieve submission details including versions, latest analysis run, and approval history.

### `POST /api/submissions/{submission_id}/versions`
Create a new version (e.g. after manual edits or applying AI suggestions) without overwriting historical copy.

---

## Compliance Analysis Pipeline (`/api/analysis`)

### `POST /api/analysis/run/{version_id}`
Execute the dual-engine compliance check on a specific submission version.
- **Returns**: Analysis run summary, explainable compliance score (0-100), and list of findings with exact character offsets.

### `PATCH /api/analysis/findings/{finding_id}`
Update finding status:
- `action`: `accepted` (applies suggested fix), `dismissed` (with required reason), `fixed`.
- Records feedback to train guideline clarity metrics.

### `POST /api/analysis/batch-apply-low-risk/{run_id}`
Automatically apply all low-risk, deterministic suggestions in a single atomic transaction.

### `POST /api/analysis/rewrite-brand-voice`
Generate a fully revised copy in the approved brand voice, returning a line-by-line diff.

---

## Reviews & Approvals (`/api/reviews`)

### `GET /api/reviews/queue` *(Reviewer & Admin)*
Get all submissions in `in_review` status awaiting human evaluation.

### `POST /api/reviews/submit-for-review/{submission_id}` *(Creator)*
Submit draft copy for formal human compliance review.

### `POST /api/reviews/decide/{submission_id}` *(Reviewer & Admin)*
Issue formal approval verdict.
- **Request Body**:
  ```json
  {
    "decision": "approved", // "approved" | "rejected" | "changes_requested"
    "comment": "Mandatory reviewer explanation citing evidence.",
    "version_no": 2
  }
  ```

---

## Visual & Accessibility Studio (`/api/visual`)

### `POST /api/visual/contrast-check`
Calculate WCAG 2.1 contrast ratio for any pair of foreground and background HEX colours.
- **Returns**: Contrast ratio (e.g. `12.4:1`), Normal text AA/AAA pass status, Large text AA/AAA pass status.

### `POST /api/visual/extract-palette`
Upload an image (`image/png`, `image/jpeg`, `image/webp`) to extract dominant colours via Pillow & NumPy, with delta-E distance matching to brand assets.

---

## Analytics & Audit (`/api/analytics`, `/api/audit`)

### `GET /api/analytics/dashboard`
Aggregated organization compliance metrics:
- Overall compliance score average & 30-day trend.
- Finding count by category & severity distribution.
- Top 5 most frequently violated rules.
- Frequently dismissed rules (signals ambiguous or counter-productive guidelines).
- Average reviewer turnaround time & rejection rates.

### `GET /api/audit/logs` *(Admin only)*
Paginated query of immutable audit events.

### `POST /api/audit/purge-retention` *(Admin only)*
Purge audit logs older than the configurable 90-day retention window.

### `POST /api/audit/privacy-erasure`
Self-service right-to-be-forgotten endpoint that anonymizes user profile data across submission history.
