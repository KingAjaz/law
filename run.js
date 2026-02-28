require('fs').readFileSync('.env.local', 'utf8').split('\n').forEach(l => {
    const m = l.match(/^([^#]+?)=(.*)$/);
    if (m) {
        let v = m[2].trim();
        if (v.startsWith('"') && v.endsWith('"')) v = v.substring(1, v.length - 1);
        process.env[m[1].trim()] = v;
    }
});
process.argv[2] = '006_update_kyc_fields.sql';
require('./scripts/run-migration.js');
