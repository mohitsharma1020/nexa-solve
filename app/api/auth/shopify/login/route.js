import { NextResponse } from 'next/server';
import crypto from 'crypto';

function base64URLEncode(buffer) {
  return buffer.toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

export async function GET(request) {
  const shopifyAuthUrl = process.env.SHOPIFY_CUSTOMER_ACCOUNT_URL;
  const clientId = process.env.SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID;
  const redirectUri = process.env.SHOPIFY_CUSTOMER_ACCOUNT_CALLBACK_URL;

  if (!shopifyAuthUrl || !clientId || !redirectUri) {
    return new NextResponse(`
      <html>
        <body style="font-family: sans-serif; padding: 2rem; text-align: center;">
          <h2>Shopify Customer Account API Not Configured</h2>
          <p>You must add the following variables to your Netlify Dashboard (or .env.local):</p>
          <ul style="list-style: none; padding: 0;">
            <li><b>SHOPIFY_CUSTOMER_ACCOUNT_URL</b></li>
            <li><b>SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID</b></li>
            <li><b>SHOPIFY_CUSTOMER_ACCOUNT_CALLBACK_URL</b></li>
          </ul>
          <p>Without these, the real Shopify login flow cannot begin.</p>
          <br>
          <a href="/account" style="padding: 0.5rem 1rem; background: #0066FF; color: white; text-decoration: none; border-radius: 4px;">Go Back</a>
        </body>
      </html>
    `, { status: 500, headers: { 'Content-Type': 'text/html' } });
  }

  // Generate PKCE code verifier & challenge
  const codeVerifier = base64URLEncode(crypto.randomBytes(32));
  const codeChallenge = base64URLEncode(crypto.createHash('sha256').update(codeVerifier).digest());

  // Generate state
  const state = base64URLEncode(crypto.randomBytes(16));

  // Build Authorization URL
  const authUrl = new URL(`${shopifyAuthUrl}/auth/oauth/authorize`);
  authUrl.searchParams.append('client_id', clientId);
  authUrl.searchParams.append('response_type', 'code');
  authUrl.searchParams.append('redirect_uri', redirectUri);
  authUrl.searchParams.append('scope', 'openid email customer_read_orders customer_read_customers');
  authUrl.searchParams.append('state', state);
  authUrl.searchParams.append('code_challenge', codeChallenge);
  authUrl.searchParams.append('code_challenge_method', 'S256');

  const response = NextResponse.redirect(authUrl.toString());

  // Store verifier and state in secure HTTP-only cookies
  const isProd = process.env.NODE_ENV === 'production';
  response.cookies.set('shopify_pkce_verifier', codeVerifier, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    maxAge: 60 * 10, // 10 minutes
    path: '/',
  });

  response.cookies.set('shopify_oauth_state', state, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    maxAge: 60 * 10,
    path: '/',
  });

  return response;
}
