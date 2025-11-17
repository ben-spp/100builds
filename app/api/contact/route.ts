import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { ServerClient } from 'postmark';

// Rate limiting: max 3 messages per hour per IP
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour in milliseconds
const MAX_REQUESTS_PER_WINDOW = 3;

// Spam detection patterns
const SPAM_PATTERNS = [
  /https?:\/\/[^\s]+/gi, // URLs
  /\b(viagra|cialis|pharmacy|casino|lottery|prize)\b/gi, // Common spam words
  /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi, // Email addresses in message
];

function detectSpam(text: string): boolean {
  for (const pattern of SPAM_PATTERNS) {
    if (pattern.test(text)) {
      return true;
    }
  }
  return false;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { slug, name, email, message } = body;

    // Validate required fields
    if (!slug || !name || !email || !message) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate message length
    if (message.length > 200) {
      return NextResponse.json(
        { error: 'Message is too long (max 200 characters)' },
        { status: 400 }
      );
    }

    // Check for HTML/script tags
    if (/<[^>]*>/g.test(message) || /<script/i.test(message)) {
      return NextResponse.json(
        { error: 'HTML and scripts are not allowed in messages' },
        { status: 400 }
      );
    }

    // Spam detection
    if (detectSpam(message)) {
      return NextResponse.json(
        { error: 'Your message was flagged as potential spam. Please remove any links or suspicious content.' },
        { status: 400 }
      );
    }

    // Get IP address
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || 'unknown';

    // Rate limiting check
    const rateLimitCheck = await pool.query(
      `SELECT COUNT(*) as count FROM contact_attempts
       WHERE ip_address = $1 AND created_at > NOW() - INTERVAL '1 hour'`,
      [ip]
    );

    const requestCount = parseInt(rateLimitCheck.rows[0].count);
    if (requestCount >= MAX_REQUESTS_PER_WINDOW) {
      return NextResponse.json(
        { error: 'Too many messages sent. Please try again later.' },
        { status: 429 }
      );
    }

    // Get project details
    const projectResult = await pool.query(
      'SELECT name, email, allow_contact FROM projects WHERE slug = $1',
      [slug]
    );

    if (projectResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    const project = projectResult.rows[0];

    // Check if contact is allowed
    if (!project.allow_contact) {
      return NextResponse.json(
        { error: 'The project owner has disabled contact for this listing' },
        { status: 403 }
      );
    }

    // Check if project has an email
    if (!project.email) {
      return NextResponse.json(
        { error: 'This project does not have contact information available' },
        { status: 400 }
      );
    }

    // Log the contact attempt
    await pool.query(
      'INSERT INTO contact_attempts (ip_address, project_slug) VALUES ($1, $2)',
      [ip, slug]
    );

    // Send email via Postmark
    const client = new ServerClient(process.env.POSTMARK_SERVER_TOKEN || '');

    try {
      await client.sendEmail({
        From: process.env.POSTMARK_FROM_EMAIL || 'noreply@100builds.com',
        To: project.email,
        ReplyTo: email,
        Subject: `🎉 New message regarding ${project.name}`,
        HtmlBody: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background: #f9fafb; border-radius: 12px; padding: 30px; margin-bottom: 20px;">
                <p style="margin: 0 0 20px 0; color: #111827; font-size: 16px;">
                  ${name} messaged you regarding your <strong>${project.name}</strong> build:
                </p>

                <div style="background: white; border-radius: 8px; padding: 20px; margin: 20px 0;">
                  <p style="margin: 0; white-space: pre-wrap; color: #111827;">${message.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>
                </div>

                <p style="margin: 20px 0 0 0; font-size: 14px; color: #6b7280;">
                  Reply to this email to respond directly to ${name}
                </p>
              </div>

              <div style="text-align: center; color: #9ca3af; font-size: 12px;">
                <p>100builds • Where builders showcase what they're building</p>
              </div>
            </body>
          </html>
        `,
        TextBody: `
${name} messaged you regarding your ${project.name} build:

${message}

Reply to this email to respond directly to ${name}

100builds • Where builders showcase what they're building
        `,
        MessageStream: 'outbound',
      });

      console.log('✅ Contact email sent to:', project.email);
    } catch (emailError) {
      console.error('Email send error:', emailError);
      return NextResponse.json(
        { error: 'Failed to send message. Please try again later.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Message sent successfully',
    });
  } catch (error) {
    console.error('Contact error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
