const fs = require('fs');
const radPassword = process.env.RADICALE_PASSWORD;

if (!radPassword) {
    console.error("Error: RADICALE_PASSWORD environment variable is not set.");
    process.exit(1);
}
async function sanitizeCalendar() {
    // Replace the URL with your actual Radicale calendar URL
    const res = await fetch('http://127.0.0.1:5232/ispik/d6ca794b-3f9a-05f7-b841-0dc37c99dc78/', {
        headers: {
            'Authorization': 'Basic ' + Buffer.from(`ispik:${radPassword}`).toString('base64')
        }
    });

    if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);

    const text = await res.text();
    const lines = text.split(/\r?\n/);
    const output = [];
    let skipping = false;

    for (const line of lines) {
        if (line.startsWith('DESCRIPTION:') || line.startsWith('LOCATION:')) {
            skipping = true;
            continue;
        }
        // Handle standard ICS multi-line folding (continuation lines start with a space or tab)
        if (skipping && (line.startsWith(' ') || line.startsWith('\t'))) {
            continue;
        }

        skipping = false;
        output.push(line);
    }

    // Save directly to the Nginx web root
    fs.writeFileSync('/var/www/calendar.ispik.dev/public.ics', output.join('\r\n'));
    console.log('Sanitized calendar exported!');
}

sanitizeCalendar();