// evidence-test.mjs - Exercises the 3 issues and prints labelled results.
// Run while the server is running on http://localhost:3000
import fs from 'node:fs';

const BASE = 'http://localhost:3000/api';
const line = (t) => console.log('\n=== ' + t + ' ===');

async function main() {
  // Login as administrator
  const lr = await fetch(`${BASE}/auth/login`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'admin', password: 'admin123' })
  });
  const lj = await lr.json();
  console.log('LOGIN status:', lr.status, '| token issued:', !!lj.token);
  const h = { 'Content-Type': 'application/json', Authorization: `Bearer ${lj.token}` };

  // TEST 1 - Server-side validation: create a diagnosis with NO data
  line('TEST 1  Validation: POST /diagnoses with empty body');
  const t1 = await fetch(`${BASE}/diagnoses`, { method: 'POST', headers: h, body: '{}' });
  const t1b = await t1.json();
  console.log('Result status:', t1.status, '| body:', JSON.stringify(t1b));
  if (t1.status === 201 && t1b.id) {           // clean up junk record if it was created
    await fetch(`${BASE}/diagnoses/${t1b.id}`, { method: 'DELETE', headers: h });
    console.log('(cleanup) junk diagnosis', t1b.id, 'was created then removed');
  }

  // TEST 2 - Referential integrity: delete a doctor who HAS patients
  line('TEST 2  Integrity: DELETE /doctors/DOC-001 (has patients)');
  const t2 = await fetch(`${BASE}/doctors/DOC-001`, { method: 'DELETE', headers: h });
  console.log('Delete status:', t2.status, '| body:', JSON.stringify(await t2.json()));
  const pj = await (await fetch(`${BASE}/patients/PAT-001`, { headers: h })).json();
  console.log('Patient PAT-001 still assigned to:', pj.assignedDoctorId,
              '| doctor exists now:', (await fetch(`${BASE}/doctors/DOC-001`, { headers: h })).status === 200);

  // TEST 3 - Password storage at rest
  line('TEST 3  Password storage in users.json');
  const users = JSON.parse(fs.readFileSync('./data/users.json', 'utf-8'));
  const admin = users.find(u => u.username === 'admin');
  console.log('Stored admin password value:', admin.password);
  console.log('Looks hashed:', !/^admin123$/.test(admin.password));
}
main().catch(e => { console.error(e); process.exit(1); });
