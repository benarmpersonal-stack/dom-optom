/**
 * Dom-Optom — End of Day mail relay
 *
 * One-time setup (5 minutes):
 *   1. Go to https://script.google.com and click "New project".
 *   2. Delete the default code, paste this entire file in, and save (File → Save).
 *   3. Click "Deploy" → "New deployment".
 *   4. Click the gear icon next to "Select type" and choose "Web app".
 *   5. Description: "Dom-Optom EoD mail" (or whatever you like).
 *      - Execute as:   "Me (your@gmail.com)"
 *      - Who has access: "Anyone"   (the URL is unguessable; only your app calls it)
 *   6. Click "Deploy". The first time, Google will ask you to authorise the script
 *      to send mail on your behalf — accept.
 *   7. Copy the "Web app URL" it gives you (looks like
 *      https://script.google.com/macros/s/AKfyc.../exec).
 *   8. In Dom-Optom → Settings → "End of day submission", paste that URL into
 *      "Web app endpoint URL" and Save. Done.
 *
 * When you click "Submit end of day" in Dom-Optom, the page POSTs the JSON
 * payload to your URL, this script runs as you, and you receive an email
 * (from yourself, to whatever recipient you set) with the JSON as a real
 * attachment. No third-party services, no API keys in the public site.
 */

function doPost(e) {
  try {
    var payload = JSON.parse(e.postData.contents);
    var to       = payload.to       || Session.getActiveUser().getEmail();
    var subject  = payload.subject  || 'Dom-Optom end of day';
    var body     = payload.body     || 'See attached JSON.';
    var filename = payload.filename || 'dom-optom-eod.json';
    var jsonText = typeof payload.data === 'string'
      ? payload.data
      : JSON.stringify(payload.data, null, 2);

    MailApp.sendEmail({
      to: to,
      subject: subject,
      body: body,
      attachments: [{
        fileName: filename,
        mimeType: 'application/json',
        content: jsonText,
      }],
    });

    return ContentService
      .createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Optional: a GET handler so you can sanity-check the URL in a browser.
function doGet() {
  return ContentService
    .createTextOutput('Dom-Optom EoD relay is live. POST JSON to this URL.')
    .setMimeType(ContentService.MimeType.TEXT);
}
