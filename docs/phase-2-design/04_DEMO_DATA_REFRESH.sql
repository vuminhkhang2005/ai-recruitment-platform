-- =====================================================================
-- 04_DEMO_DATA_REFRESH.sql
-- Idempotent maintenance script for the local demo database.
--  1. Re-open seeded job postings whose deadline has passed (seed used NOW()+N days).
--  2. Close duplicate postings created by automated UI tests.
--  3. Recompute application match scores from real skill overlap
--     (same formula as MatchingService: required skills weight 1, optional 0.5,
--      matched skill with fewer years than required counts 70%).
-- Usage: mysql -u root -p ai_recruitment_db < 04_DEMO_DATA_REFRESH.sql
-- =====================================================================

-- 1. Extend expired seeded jobs to a spread of future deadlines (10..49 days)
UPDATE jobs
SET deadline = DATE_ADD(NOW(), INTERVAL (10 + (id * 7) % 40) DAY)
WHERE status = 'PUBLISHED'
  AND deleted_at IS NULL
  AND deadline IS NOT NULL
  AND deadline < NOW();

-- 2. Close duplicate postings (same recruiter + same title), keeping the newest one
UPDATE jobs j
JOIN (
    SELECT recruiter_id, title, MAX(id) AS keep_id
    FROM jobs
    WHERE deleted_at IS NULL
    GROUP BY recruiter_id, title
    HAVING COUNT(*) > 1
) d ON d.recruiter_id = j.recruiter_id AND d.title = j.title AND j.id <> d.keep_id
SET j.status = 'CLOSED', j.deleted_at = NOW();

-- 3. Recompute match scores
UPDATE job_applications SET match_score = NULL;

UPDATE job_applications a
JOIN (
    SELECT a2.id,
           ROUND(100 * SUM(CASE
                               WHEN cs.id IS NULL THEN 0
                               WHEN cs.years_experience >= js.min_years_exp THEN js.w
                               ELSE js.w * 0.7
                           END) / SUM(js.w)) AS score
    FROM job_applications a2
    JOIN (SELECT job_id, skill_id, min_years_exp, weight * IF(is_required, 1, 0.5) AS w FROM job_skills) js
         ON js.job_id = a2.job_id
    LEFT JOIN candidate_skills cs
         ON cs.candidate_profile_id = a2.candidate_profile_id AND cs.skill_id = js.skill_id
    WHERE EXISTS (SELECT 1 FROM candidate_skills c WHERE c.candidate_profile_id = a2.candidate_profile_id)
    GROUP BY a2.id
) s ON s.id = a.id
SET a.match_score = s.score;

-- 4. Company logos: the Clearbit logo API has been shut down, so the seeded URLs are broken images.
--    Point the companies we ship logos for to /public/logos, clear the rest (UI falls back to initials).
UPDATE companies SET logo_url = '/logos/fpt.svg'      WHERE logo_url LIKE '%clearbit.com/fpt-software.com%';
UPDATE companies SET logo_url = '/logos/vng.svg'      WHERE logo_url LIKE '%clearbit.com/vng.com.vn%';
UPDATE companies SET logo_url = '/logos/viettel.svg'  WHERE logo_url LIKE '%clearbit.com/viettel.com.vn%';
UPDATE companies SET logo_url = '/logos/onemount.svg' WHERE logo_url LIKE '%clearbit.com/onemount.com%';
UPDATE companies SET logo_url = '/logos/momo.png'     WHERE logo_url LIKE '%clearbit.com/momo.vn%';
UPDATE companies SET logo_url = NULL                  WHERE logo_url LIKE '%logo.clearbit.com%';

-- 5. Normalise city spelling so the city filter finds every job.
UPDATE jobs SET location_city = 'TP. Hồ Chí Minh' WHERE location_city IN ('TP Ho Chi Minh', 'Ho Chi Minh', 'HCM', 'TP HCM');

-- 6. applications_count must reflect real applications, not seeded numbers.
UPDATE jobs j SET applications_count = (SELECT COUNT(*) FROM job_applications a WHERE a.job_id = j.id);
