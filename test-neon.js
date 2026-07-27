const { Pool } = require('@neondatabase/serverless');

const connectionString = "postgresql://neondb_owner:npg_cqtBCl53WMmU@ep-snowy-dust-asegelc9.c-4.eu-central-1.aws.neon.tech/neondb?sslmode=require";

console.log("Using:", connectionString);

const pool = new Pool({ connectionString });
pool.query('SELECT NOW()').then(res => {
  console.log("Connected!", res.rows[0]);
  process.exit(0);
}).catch(err => {
  console.error("Error:", err.message);
  process.exit(1);
});
