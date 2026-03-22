// Cloudflare Pages Function — creates GitHub Issue for memorial submissions
// Env var GITHUB_TOKEN must be set in Cloudflare Pages dashboard

interface Env {
  GITHUB_TOKEN: string;
}

interface SubmissionBody {
  entryNumber: number | null;
  humanity: string;
  relationship: string;
  age: number | null;
  region: string;
  contactEmail: string;
  photoUrl: string | null;
}

const REPO = 'oilburntracker/oilburntracker';

// Simple in-memory rate limit (resets on cold start — good enough)
const ipHits = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = ipHits.get(ip);
  if (!entry || now > entry.resetAt) {
    ipHits.set(ip, { count: 1, resetAt: now + 3600000 });
    return false;
  }
  entry.count++;
  return entry.count > 3;
}

function corsHeaders(): Record<string, string> {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };
}

export const onRequestOptions: PagesFunction = async () => {
  return new Response(null, { status: 204, headers: corsHeaders() });
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const ip = context.request.headers.get('CF-Connecting-IP') || 'unknown';

  if (isRateLimited(ip)) {
    return Response.json(
      { error: 'Too many submissions. Please try again later.' },
      { status: 429, headers: corsHeaders() }
    );
  }

  const token = context.env.GITHUB_TOKEN;
  if (!token) {
    return Response.json(
      { error: 'Submissions are not configured yet.' },
      { status: 503, headers: corsHeaders() }
    );
  }

  let body: SubmissionBody;
  try {
    body = await context.request.json();
  } catch {
    return Response.json(
      { error: 'Invalid request body.' },
      { status: 400, headers: corsHeaders() }
    );
  }

  // Validate
  if (!body.humanity || body.humanity.length < 10 || body.humanity.length > 280) {
    return Response.json(
      { error: 'Description must be 10-280 characters.' },
      { status: 400, headers: corsHeaders() }
    );
  }
  if (!body.relationship || !body.region || !body.contactEmail) {
    return Response.json(
      { error: 'Missing required fields.' },
      { status: 400, headers: corsHeaders() }
    );
  }

  // Build GitHub issue
  const entryLabel = body.entryNumber ? `#${body.entryNumber}` : '(unassigned)';
  const title = `Memorial ${entryLabel}: ${body.humanity.slice(0, 60)}`;
  const issueBody = [
    `## Memorial Submission ${entryLabel}`,
    '',
    `**Who they were:** ${body.humanity}`,
    `**Relationship:** ${body.relationship}`,
    `**Age:** ${body.age ?? 'Not provided'}`,
    `**Region:** ${body.region}`,
    `**Photo:** ${body.photoUrl || 'None'}`,
    '',
    '---',
    `*Submitted by: ${body.contactEmail}*`,
    `*Entry number: ${body.entryNumber ?? 'Unassigned'}*`,
    `*Submitted: ${new Date().toISOString()}*`,
    '',
    '> To approve: add the `approved` label. To reject: close the issue.',
    '> Community reactions help prioritize.',
  ].join('\n');

  try {
    const res = await fetch(`https://api.github.com/repos/${REPO}/issues`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github+json',
        'User-Agent': 'OilBurnTracker/1.0',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title,
        body: issueBody,
        labels: ['memorial-submission'],
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error('GitHub API error:', res.status, errText);
      return Response.json(
        { error: 'Failed to create submission. Please try again.' },
        { status: 502, headers: corsHeaders() }
      );
    }

    const issue = await res.json() as { number: number; html_url: string };
    return Response.json(
      { success: true, issueNumber: issue.number, url: issue.html_url },
      { status: 201, headers: corsHeaders() }
    );
  } catch (err) {
    console.error('Submission error:', err);
    return Response.json(
      { error: 'Internal error. Please try again.' },
      { status: 500, headers: corsHeaders() }
    );
  }
};
