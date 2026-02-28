require('fs').readFileSync('.env.local', 'utf8').split('\n').forEach(l => {
    const m = l.match(/^([^#]+?)=(.*)$/);
    if (m) {
        let v = m[2].trim();
        if (v.startsWith('"') && v.endsWith('"')) v = v.substring(1, v.length - 1);
        process.env[m[1].trim()] = v;
    }
});
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function test() {
    // Simulate what the production app would request
    const appUrl = 'https://legaleaseadvisory.com';
    console.log("Generating password reset link mimicking production...");
    const { data, error } = await supabase.auth.admin.generateLink({
        type: 'recovery',
        email: 'ajalaayodeji125@gmail.com',
        options: {
            redirectTo: `${appUrl}/auth/callback?type=recovery` // The exact string `lib/auth.ts` uses in production
        }
    });

    if (error) {
        fs.writeFileSync('test-prod-link.json', JSON.stringify({ error }));
        console.error("Error generating link", error);
    } else {
        fs.writeFileSync('test-prod-link.json', JSON.stringify({ link: data.properties.action_link }, null, 2));
        console.log("Written product link test format to test-prod-link.json");
    }
}
test();
