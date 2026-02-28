require('fs').readFileSync('.env.local', 'utf8').split('\n').forEach(l => {
    const m = l.match(/^([^#]+?)=(.*)$/);
    if (m) {
        let v = m[2].trim();
        if (v.startsWith('"') && v.endsWith('"')) v = v.substring(1, v.length - 1);
        process.env[m[1].trim()] = v;
    }
});
const { Resend } = require('resend');

async function test() {
    console.log("Sending email from legaleaseadvisory.com to arbitrary address...");
    try {
        const resend = new Resend(process.env.RESEND_API_KEY);
        const result = await resend.emails.send({
            from: 'LegalEase <noreply@legaleaseadvisory.com>',
            to: 'ajalaayodeji125@gmail.com', // Sending to the user's email
            subject: 'Test Verification - Resend is Working',
            html: '<p>Link...</p>'
        });
        if (result.error) {
            console.error('RESEND ERROR:', result.error.message);
        } else {
            console.log('RESEND SUCCESS ID:', result.data.id);
        }
    } catch (e) {
        console.error("CAUGHT EXCEPTION:", e);
    }
}
test();
