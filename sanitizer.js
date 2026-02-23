const fs = require('fs');
const protonUrl = process.env.PROTON_CALENDAR_URL;

if (!protonUrl) {
    console.error("Error: PROTON_CALENDAR_URL environment variable is not set.");
    process.exit(1);
}
async function sanitizeCalendar() {
    // Replace the URL with your actual Radicale calendar URL
    const res = await fetch(protonUrl);

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