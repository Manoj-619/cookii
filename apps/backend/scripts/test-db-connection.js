/**
 * MongoDB Atlas Connection Diagnostic Tool
 * Usage:
 *   node scripts/test-db-connection.js "mongodb+srv://user:pass@cluster0.xxx.mongodb.net/cookii?retryWrites=true&w=majority"
 * Or runs with MONGODB_URI from .env
 */
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

// Try reading from .env if not passed as CLI argument
let uri = process.argv[2];

if (!uri) {
  const envCandidates = [
    path.resolve(process.cwd(), '.env.development'),
    path.resolve(process.cwd(), '.env'),
    path.resolve(__dirname, '../../../.env.development'),
    path.resolve(__dirname, '../../../.env'),
    path.resolve(__dirname, '../../.env.development'),
    path.resolve(__dirname, '../../.env'),
  ];

  for (const envPath of envCandidates) {
    if (fs.existsSync(envPath)) {
      const lines = fs.readFileSync(envPath, 'utf8').split('\n');
      for (const line of lines) {
        if (line.trim().startsWith('MONGODB_URI=')) {
          uri = line.trim().substring('MONGODB_URI='.length).trim();
          break;
        }
      }
      if (uri) break;
    }
  }
}

if (!uri) {
  uri = 'mongodb://127.0.0.1:27017/cookii';
}

const safeUri = uri.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@');
console.log('\n========================================');
console.log('   Cookii MongoDB Connection Diagnostic');
console.log('========================================');
console.log(`Connecting to: ${safeUri}\n`);

(async () => {
  try {
    const start = Date.now();
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 8000,
      connectTimeoutMS: 8000,
    });

    const elapsed = Date.now() - start;
    console.log(`✓ CONNECTION SUCCESSFUL! (${elapsed}ms)`);
    console.log(`  Database Name: ${mongoose.connection.name}`);
    console.log(`  Host:          ${mongoose.connection.host}`);
    console.log(`  Port:          ${mongoose.connection.port || 'default srv'}`);
    console.log(`  Ready State:   ${mongoose.connection.readyState} (1 = connected)`);

    // Ping admin DB
    const admin = mongoose.connection.db.admin();
    const pingRes = await admin.ping();
    console.log(`  Ping Check:    ${JSON.stringify(pingRes)}`);

    console.log('\nAtlas database is active and ready for Cookii production!\n');
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('\n✗ CONNECTION FAILED');
    console.error(`  Error: ${err.message}`);
    if (err.name === 'MongoServerSelectionError') {
      console.error('\n  Troubleshooting Tips:');
      console.error('  1. In MongoDB Atlas, go to "Network Access" and ensure 0.0.0.0/0 (or your IP) is allowed.');
      console.error('  2. Verify your username and password in "Database Access".');
      console.error('  3. If your password has special characters like @, #, %, URL-encode them (e.g. @ -> %40).');
    }
    process.exit(1);
  }
})();

