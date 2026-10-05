/**
 * Real backend E2E (API level): recruiter posts job -> candidate uploads CV & applies ->
 * recruiter sees applicant, downloads CV, moves stage -> candidate sees new stage, timeline and notification.
 * Also checks the security rules that replaced the old demo fallbacks.
 *
 * Run: node test_real_backend_flow.cjs   (backend on http://localhost:8080)
 */
const { request } = require('playwright');

const API = 'http://localhost:8080/api/v1';
const PASSWORD = 'Password@123';
const CANDIDATE = 'nguyenvanan.it@gmail.com';
const RECRUITER = 'recruiter.vng@vng.com.vn';
const OTHER_RECRUITER = 'jobs.tiki@tiki.vn';

let failures = 0;
function check(cond, msg) {
  if (cond) console.log('  ✔', msg);
  else { console.error('  ✘', msg); failures++; }
}

async function login(ctx, email) {
  const r = await ctx.post(`${API}/auth/login`, { data: { email, password: PASSWORD } });
  const body = await r.json();
  if (!r.ok()) throw new Error(`login ${email} failed: ${r.status()} ${body.message}`);
  return body.data.accessToken;
}

const auth = (t) => ({ Authorization: `Bearer ${t}` });

(async () => {
  const ctx = await request.newContext();
  // Separate context so HttpOnly auth cookies set by logins never leak into "anonymous" requests
  const anonCtx = await request.newContext();

  console.log('1. Seeded demo accounts can log in with the documented password');
  const cand = await login(ctx, CANDIDATE);
  const rec = await login(ctx, RECRUITER);
  const other = await login(ctx, OTHER_RECRUITER);
  check(!!cand && !!rec && !!other, 'candidate + 2 recruiters logged in');

  const bad = await ctx.post(`${API}/auth/login`, { data: { email: CANDIDATE, password: 'wrong-password' } });
  check(bad.status() === 401 || bad.status() === 400, `wrong password rejected (${bad.status()})`);

  const adminReg = await ctx.post(`${API}/auth/register`, {
    data: { email: `x${Date.now()}@test.vn`, password: 'Secret123', fullName: 'X', role: 'ROLE_ADMIN' },
  });
  check(adminReg.status() === 400, 'self-registering as ADMIN is refused');

  console.log('2. Recruiter posts a job for their own company');
  const title = `QA Real Flow Engineer ${Date.now()}`;
  const created = await ctx.post(`${API}/jobs`, {
    headers: auth(rec),
    data: {
      title, description: 'Kiểm thử luồng tuyển dụng thật.', requirements: '2+ năm kinh nghiệm .NET',
      jobType: 'FULL_TIME', expLevel: 'MIDDLE', minSalary: 20000000, maxSalary: 30000000,
      locationCity: 'TP. Hồ Chí Minh', skills: ['C#', '.NET Core', 'SQL Server'],
    },
  });
  check(created.status() === 201, `job created (${created.status()})`);
  const job = (await created.json()).data;
  const recMe = (await (await ctx.get(`${API}/users/me`, { headers: auth(rec) })).json()).data;
  check(job.companyName === recMe.companyName, `job belongs to recruiter company (${job.companyName})`);
  check(job.aiMatchScore === undefined && job.bonus === undefined, 'no fake aiMatchScore/bonus fields');

  const mine = await (await ctx.get(`${API}/jobs/mine`, { headers: auth(rec) })).json();
  check(mine.data.some((j) => j.id === job.id), '/jobs/mine lists the new job');

  console.log('3. Anonymous users cannot apply');
  const anon = await anonCtx.post(`${API}/applications`, { data: { jobId: job.id } });
  check(anon.status() === 401, `anonymous apply -> 401 (${anon.status()})`);
  const quick = await anonCtx.post(`${API}/applications/quick-apply`, { data: { jobId: job.id } });
  check(quick.status() === 401 || quick.status() === 404 || quick.status() === 405, `legacy quick-apply removed (${quick.status()})`);

  console.log('4. Candidate sees a real match score and uploads a CV');
  const ms = await (await ctx.get(`${API}/candidates/me/match-scores?jobIds=${job.id}`, { headers: auth(cand) })).json();
  const match = ms.data[0];
  check(match && Array.isArray(match.matchedSkills) && Array.isArray(match.missingSkills), `match breakdown returned (score=${match && match.score})`);

  const pdf = Buffer.from('%PDF-1.4\n1 0 obj<<>>endobj\ntrailer<<>>\n%%EOF\n');
  const up = await ctx.post(`${API}/candidates/me/cvs`, {
    headers: auth(cand),
    multipart: { file: { name: 'CV_Nguyen_Van_An.pdf', mimeType: 'application/pdf', buffer: pdf }, title: 'CV test thật' },
  });
  check(up.status() === 201, `CV uploaded (${up.status()})`);
  const cv = (await up.json()).data;
  check(cv.downloadable === true, 'uploaded CV is downloadable');

  const badUp = await ctx.post(`${API}/candidates/me/cvs`, {
    headers: auth(cand),
    multipart: { file: { name: 'virus.exe', mimeType: 'application/octet-stream', buffer: Buffer.from('MZ') } },
  });
  check(badUp.status() === 400, 'non-PDF/DOC upload rejected');

  console.log('5. Candidate applies with that CV');
  const applied = await ctx.post(`${API}/applications`, {
    headers: auth(cand),
    data: { jobId: job.id, cvId: cv.id, coverLetter: 'Em rất mong được trao đổi thêm.' },
  });
  check(applied.status() === 201, `applied (${applied.status()})`);
  const app = (await applied.json()).data;
  check(app.currentStage === 'APPLIED', 'stage = APPLIED');
  check(app.cvId === cv.id, 'application references the chosen CV');
  check(app.history.length === 1 && app.history[0].toStage === 'APPLIED', 'timeline has the APPLIED entry');

  const dup = await ctx.post(`${API}/applications`, { headers: auth(cand), data: { jobId: job.id } });
  check(dup.status() === 400, 'duplicate application rejected');

  console.log('6. Recruiter sees the applicant; other recruiters cannot');
  const recApps = await (await ctx.get(`${API}/applications/recruiter`, { headers: auth(rec) })).json();
  const seen = recApps.data.find((a) => a.id === app.id);
  check(!!seen, 'application appears in recruiter inbox');
  check(seen && seen.candidateEmail === CANDIDATE, 'recruiter sees candidate contact');
  check(seen && Array.isArray(seen.candidateSkills) && seen.candidateSkills.length > 0, `recruiter sees candidate skills (${seen && seen.candidateSkills.join(', ')})`);

  const forbidden = await ctx.get(`${API}/applications/job/${job.id}`, { headers: auth(other) });
  check(forbidden.status() === 403, `other company recruiter -> 403 (${forbidden.status()})`);

  const file = await ctx.get(`${API}/cvs/${cv.id}/file`, { headers: auth(rec) });
  check(file.ok() && (await file.body()).toString().startsWith('%PDF'), 'recruiter can open the CV file');
  const fileOther = await ctx.get(`${API}/cvs/${cv.id}/file`, { headers: auth(other) });
  check(fileOther.status() === 403, 'other recruiter cannot open the CV');

  console.log('7. Recruiter moves the candidate to INTERVIEW; candidate cannot change stages');
  const candPatch = await ctx.patch(`${API}/applications/${app.id}/status`, { headers: auth(cand), data: { currentStage: 'HIRED' } });
  check(candPatch.status() === 403, 'candidate cannot change stage');
  const patched = await ctx.patch(`${API}/applications/${app.id}/status`, { headers: auth(rec), data: { currentStage: 'INTERVIEW' } });
  check(patched.ok(), `recruiter moved stage (${patched.status()})`);

  console.log('8. Candidate sees the update, timeline and notification');
  const myApps = await (await ctx.get(`${API}/applications/me`, { headers: auth(cand) })).json();
  const mineApp = myApps.data.find((a) => a.id === app.id);
  check(mineApp && mineApp.currentStage === 'INTERVIEW', 'candidate sees INTERVIEW');
  check(mineApp && mineApp.history.map((h) => h.toStage).join('>') === 'APPLIED>INTERVIEW', 'timeline APPLIED>INTERVIEW');
  const notifs = await (await ctx.get(`${API}/notifications`, { headers: auth(cand) })).json();
  check(notifs.data.some((n) => n.referenceId === app.id && n.type === 'APPLICATION_STATUS'), 'candidate got a status notification');
  const recNotifs = await (await ctx.get(`${API}/notifications`, { headers: auth(rec) })).json();
  check(recNotifs.data.some((n) => n.referenceId === app.id && n.type === 'NEW_APPLICATION'), 'recruiter got a new-application notification');

  console.log('9. Withdraw is blocked after interview; cleanup');
  const wd = await ctx.delete(`${API}/applications/${app.id}`, { headers: auth(cand) });
  check(wd.status() === 400, 'cannot withdraw after INTERVIEW');
  await ctx.patch(`${API}/applications/${app.id}/status`, { headers: auth(rec), data: { currentStage: 'REJECTED', rejectionReason: 'Test cleanup' } });
  await ctx.delete(`${API}/jobs/${job.id}`, { headers: auth(rec) });
  await ctx.delete(`${API}/candidates/me/cvs/${cv.id}`, { headers: auth(cand) });
  const pub = await (await anonCtx.get(`${API}/jobs?keyword=${encodeURIComponent(title)}`)).json();
  check(pub.data.items.length === 0, 'closed job no longer in public search');

  await ctx.dispose();
  await anonCtx.dispose();
  console.log(failures === 0 ? '\nALL CHECKS PASSED' : `\n${failures} CHECK(S) FAILED`);
  process.exit(failures === 0 ? 0 : 1);
})().catch((e) => { console.error(e); process.exit(1); });
