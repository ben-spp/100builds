import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import crypto from 'crypto';
import { ServerClient } from 'postmark';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { slug, email, allowContact = true } = body;

    if (!slug || !email) {
      return NextResponse.json(
        { error: 'Slug and email are required' },
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

    // Find project
    const result = await pool.query(
      'SELECT * FROM projects WHERE slug = $1',
      [slug]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    const project = result.rows[0];

    // Check if already claimed
    if (project.claimed) {
      return NextResponse.json(
        { error: 'This build has already been claimed' },
        { status: 400 }
      );
    }

    // Generate claim token
    const claimToken = crypto.randomBytes(32).toString('hex');

    // Update project
    await pool.query(
      'UPDATE projects SET email = $1, claim_token = $2, claimed = FALSE, allow_contact = $3 WHERE slug = $4',
      [email, claimToken, allowContact, slug]
    );

    // Generate verification URL
    const verificationUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:8888'}/api/verify-claim?token=${claimToken}&slug=${slug}`;

    // Send verification email via Postmark
    const client = new ServerClient(process.env.POSTMARK_SERVER_TOKEN || '');

    try {
      await client.sendEmail({
        From: process.env.POSTMARK_FROM_EMAIL || 'hello@100builds.com',
        To: email,
        Subject: '✨ Claim your build on 100builds',
        HtmlBody: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 30px;">
                <tr>
                  <td style="background: #667eea; border-radius: 12px; padding: 30px; text-align: center;">
                    <h1 style="color: #333333; margin: 0; font-size: 28px; font-weight: 700;">🎉 Your build is ready!</h1>
                  </td>
                </tr>
              </table>

              <div style="background: #f9fafb; border-radius: 12px; padding: 30px; margin-bottom: 20px;">
                <p style="margin: 0 0 20px 0; font-size: 16px;">
                  Thanks for sharing your project on <strong>100builds</strong>!
                </p>
                <p style="margin: 0 0 20px 0; font-size: 16px;">
                  Click the button below to claim your build and unlock editing abilities:
                </p>
                <div style="text-align: center; margin: 30px 0;">
                  <table cellpadding="0" cellspacing="0" border="0" style="margin: 0 auto;">
                    <tr>
                      <td style="background: #667eea; border-radius: 12px; padding: 14px 32px;">
                        <a href="${verificationUrl}" style="color: #ffffff !important; text-decoration: none; font-weight: 600; font-size: 16px; display: block;">
                          Claim Your Build
                        </a>
                      </td>
                    </tr>
                  </table>
                </div>
                <p style="margin: 20px 0 0 0; font-size: 14px; color: #6b7280;">
                  This link expires in 24 hours. If you didn't create a build on 100builds, you can safely ignore this email.
                </p>
              </div>

              <div style="text-align: center; color: #9ca3af; font-size: 12px;">
                <p>100builds • Where builders showcase what they're building</p>
              </div>
            </body>
          </html>
        `,
        TextBody: `
🎉 Your build is ready!

Thanks for sharing your project on 100builds!

Click the link below to claim your build and unlock editing abilities:
${verificationUrl}

This link expires in 24 hours. If you didn't create a build on 100builds, you can safely ignore this email.

---
100builds • Where builders showcase what they're building
        `,
        MessageStream: 'outbound',
      });

      console.log('✅ Verification email sent to:', email);
    } catch (emailError) {
      console.error('Email send error:', emailError);
      // Still log the link for development
      console.log('\n🔗 Verification link (email failed):', verificationUrl, '\n');
    }

    return NextResponse.json({
      success: true,
      message: 'Verification email sent! Check your inbox.',
    });
  } catch (error) {
    console.error('Claim build error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
