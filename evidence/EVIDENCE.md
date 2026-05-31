# MRMS Optimisation Evidence (Activity 4 – C.P4, C.P5, C.M3 / BC.D2)

This document records how the CareTrack MRMS was **tested**, the **weaknesses found**, and how the
system was **optimised** in response. Each item follows the same structure: the test, the *before*
result, the change made, and the *after* result. Raw transcripts are in `evidence/before.txt` and
`evidence/after.txt`; the change history is in Git (`git log --oneline`).

## How the tests were run
- Server: `cd Backend && npm start` (Express, http://localhost:3000)
- Test harness: `Backend/evidence-test.mjs` — logs in as the administrator and exercises the three
  issues automatically, printing the HTTP status and response body for each.
- Seed data was backed up before each run and restored afterward so results are repeatable.

## Git timeline (before/after proof)
```
d56ea60  Baseline: MRMS before optimisation (testing/feedback)
7d54ba2  Fix1(security): hash stored passwords with salted scrypt; verify on login
2d07814  Fix2/3(integrity+validation): block deletes that orphan records; reject missing required fields
444444b  Fix4(quality): rebuild malformed login.html into a single valid document
313e037  test/evidence: API before/after transcripts and test harness
```

---

## Test summary

| # | Test | Before | After | Criterion |
|---|------|--------|-------|-----------|
| 1 | Create diagnosis with empty body | `201 Created` – junk saved | `400` – fields rejected | C.P5 / C.M3 |
| 2 | Delete a doctor who has patients | `200` – patient left orphaned | `409` – blocked, data intact | C.P5 / C.M3 |
| 3 | Inspect stored password | `admin123` (plain text) | salted scrypt hash | C.M3 / BC.D2 |
| – | Login after hashing | n/a | `200` – still works | C.P4 (no regression) |

---

## Optimisation 1 — Passwords stored in plain text (security)

**Test:** Read `data/users.json` and attempt login.
**Before:** Passwords stored as plain text (`"password": "admin123"`); login compared raw strings.
For a healthcare system holding patient data this is a serious confidentiality failure.

```
TEST 3  Password storage in users.json
Stored admin password value: admin123
Looks hashed: false
```

**Change:** Added `utils/password.js` using Node's built-in `crypto` to create a **salted scrypt**
hash per user (format `scrypt$<salt>$<hash>`), with constant-time comparison (`timingSafeEqual`).
`authController.login` now verifies against the hash; `userController` hashes on user create/update;
existing seed accounts were migrated.

```js
function hashPassword(plain) {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.scryptSync(plain, salt, 64).toString('hex');
    return `scrypt$${salt}$${hash}`;
}
```

**After:** Passwords are stored only as salted hashes, and login still succeeds with the same
credentials — confirming the security upgrade introduced no regression.

```
LOGIN status: 200 | token issued: true
TEST 3  Password storage in users.json
Stored admin password value: scrypt$1082b91f...1b1221d
Looks hashed: true
```

---

## Optimisation 2 — No referential integrity on delete (data integrity)

**Test:** As administrator, `DELETE /api/doctors/DOC-001` (a doctor with assigned patients).
**Before:** The doctor was deleted and patient `PAT-001` was left pointing at a doctor that no
longer existed (an orphaned/dangling reference) — corrupting the Doctor→Patient relationship.

```
TEST 2  Integrity: DELETE /doctors/DOC-001 (has patients)
Delete status: 200 | body: {"message":"Doctor deleted successfully."}
Patient PAT-001 still assigned to: DOC-001 | doctor exists now: false
```

**Change:** Added guards in `doctorController.deleteDoctor` (block if any patient is assigned) and
`patientController.deletePatient` (block if any diagnosis is linked), returning `409 Conflict`.

```js
const assignedPatients = readData('patients.json').filter(p => p.assignedDoctorId === req.params.id);
if (assignedPatients.length > 0) {
    return res.status(409).json({ error: `Cannot delete this doctor: ${assignedPatients.length} patient(s) are still assigned. Reassign them first.` });
}
```

**After:** The delete is refused with a clear message and the data stays consistent.

```
TEST 2  Integrity: DELETE /doctors/DOC-001 (has patients)
Delete status: 409 | body: {"error":"Cannot delete this doctor: 3 patient(s) are still assigned. Reassign them first."}
Patient PAT-001 still assigned to: DOC-001 | doctor exists now: true
```

---

## Optimisation 3 — No server-side validation (functionality/usability)

**Test:** `POST /api/diagnoses` with an empty body `{}`.
**Before:** The record was created (`201`) with no patient, ICD code, description or severity —
allowing meaningless clinical data into the system.

```
TEST 1  Validation: POST /diagnoses with empty body
Result status: 201 | body: {"id":"DIA-...","createdBy":"Mirzobek Tursunov","lastUpdated":"2026-05-31"}
```

**Change:** Added required-field checks to `createDiagnosis`, `createPatient` and `createDoctor`,
returning `400 Bad Request` listing the missing fields. This complements the existing client-side
validation with a server-side guarantee.

```js
const required = ['patientId', 'icdCode', 'description', 'severity'];
const missing = required.filter(f => !req.body[f] || String(req.body[f]).trim() === '');
if (missing.length) return res.status(400).json({ error: `Missing required field(s): ${missing.join(', ')}` });
```

**After:** Invalid records are rejected with a helpful message.

```
TEST 1  Validation: POST /diagnoses with empty body
Result status: 400 | body: {"error":"Missing required field(s): patientId, icdCode, description, severity"}
```

---

## Optimisation 4 — Malformed `login.html` (code quality)

**Test:** Open `Frontend/login.html` / validate the markup.
**Before:** The file contained a truncated outer document followed by a second complete
`<!DOCTYPE html>` document nested inside — invalid HTML that only rendered by browser leniency.
**Change:** Rebuilt as a single valid HTML5 document (commit `444444b`).
**After:** One well-formed document; login screen renders and functions identically.

---

## Browser screenshots still to capture (visual layer)
The API transcripts above are the substantive proof. To complete the visual evidence, capture these
in the browser (Before = `git stash`/checkout `d56ea60`; After = current). Suggested shots:

1. **Login page** — before (broken markup view-source) vs after (clean) + successful login.
2. **Validation** — submitting an empty Add-Diagnosis form: before (saved) vs after (error shown).
3. **Integrity** — deleting a doctor with patients: before (doctor gone, profile shows missing) vs
   after (409 toast "Cannot delete…").
4. **Password at rest** — `data/users.json` open in editor: before (plain text) vs after (hashes).
5. **Compatibility** — the dashboard on Chrome, Firefox, and a mobile width (DevTools device bar).

Save them under `evidence/screenshots/` named `01-login-before.png`, `01-login-after.png`, etc.
