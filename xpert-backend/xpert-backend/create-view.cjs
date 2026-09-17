const { PrismaClient } = require('./src/generated/tenant/index.js');
require('dotenv').config();
const db = new PrismaClient({ datasources: { db: { url: process.env.TENANT_DATABASE_URL } } });

async function run() {
  try {
    const sql = `
CREATE OR REPLACE VIEW v_job_stats AS
SELECT
    j.id AS job_id,

    COALESCE(r.resume_count, 0) AS resume_count,
    COALESCE(c.short_list_count, 0) AS short_list_count,
    COALESCE(c.total_candidates, 0) AS total_candidates,

    CASE WHEN COALESCE(c.total_candidates, 0) = 0 THEN 0
         ELSE ROUND(100.0 * COALESCE(c.matched_count, 0) / c.total_candidates)
    END AS matched_percent,

    CASE WHEN COALESCE(c.total_candidates, 0) = 0 THEN 0
         ELSE ROUND(100.0 * COALESCE(c.rejected_count, 0) / c.total_candidates)
    END AS rejected_percent

FROM jobs j

LEFT JOIN LATERAL (
    SELECT COUNT(*) AS resume_count
    FROM job_resumes jr
    WHERE jr.job_id = j.id
) r ON true

LEFT JOIN LATERAL (
    SELECT
        COUNT(*)                                                              AS total_candidates,
        COUNT(*) FILTER (WHERE resp.status IN ('recommended','shortlisted'))  AS matched_count,
        COUNT(*) FILTER (WHERE resp.status IN ('recommended','shortlisted'))  AS short_list_count,
        COUNT(*) FILTER (WHERE resp.status = 'rejected')                      AS rejected_count
    FROM job_responses resp
    WHERE resp.job_id = j.id
) c ON true;
    `;
    await db.$executeRawUnsafe(sql);
    console.log('SUCCESS: View created');
  } catch (e) {
    console.log('ERROR:', e.message);
  } finally {
    await db.$disconnect();
  }
}
run();
