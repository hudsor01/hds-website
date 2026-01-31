/**
 * Test script to verify Neon database connection
 * Run: bun run scripts/test-neon-connection.ts
 */
import { SQL } from 'bun';

async function testConnection() {
  const connectionUrl = process.env.POSTGRES_URL;

  if (!connectionUrl) {
    console.error('ERROR: POSTGRES_URL environment variable is not set');
    console.warn('Please add POSTGRES_URL to your .env.local file');
    process.exit(1);
  }

  console.warn('Connecting to Neon PostgreSQL...\n');

  const sql = new SQL(connectionUrl);

  try {
    // Test 1: Get PostgreSQL version
    const [versionResult] = await sql`SELECT version()`;
    console.warn('Connected to Neon!');
    console.warn('PostgreSQL version:', versionResult.version);
    console.warn('');

    // Test 2: Get server time
    const [timeResult] = await sql`SELECT NOW() as current_time`;
    console.warn('Server time:', timeResult.current_time);
    console.warn('');

    // Test 3: Check available extensions
    const extensions = await sql`
      SELECT extname, extversion
      FROM pg_extension
      ORDER BY extname
    `;
    console.warn('Installed extensions:');
    for (const ext of extensions) {
      console.warn(`  - ${ext.extname} (${ext.extversion})`);
    }
    console.warn('');

    // Test 4: Check connection info
    const [connInfo] = await sql`
      SELECT
        current_database() as database,
        current_user as user,
        inet_server_addr() as server_ip
    `;
    console.warn('Connection info:');
    console.warn(`  Database: ${connInfo.database}`);
    console.warn(`  User: ${connInfo.user}`);
    console.warn('');

    console.warn('All connection tests passed!');

    await sql.close();
    process.exit(0);
  } catch (error) {
    console.error('Connection test failed:', error);
    await sql.close();
    process.exit(1);
  }
}

testConnection();
