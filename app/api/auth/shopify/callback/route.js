import { NextResponse } from 'next/server';

export async function GET(request) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const error = url.searchParams.get('error');

  const shopifyAuthUrl = process.env.SHOPIFY_CUSTOMER_ACCOUNT_URL;
  const clientId = process.env.SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID;
  const redirectUri = process.env.SHOPIFY_CUSTOMER_ACCOUNT_CALLBACK_URL;
  
  if (error) {
    return NextResponse.redirect(new URL(`/account?tab=orders&error=${error}`, request.url));
  }

  if (!code || !state) {
    return NextResponse.redirect(new URL('/account?tab=orders&error=missing_params', request.url));
  }

  // Verify state
  const cookieState = request.cookies.get('shopify_oauth_state')?.value;
  console.log('[Shopify Callback] Received code and state. Validating state...');
  
  if (!cookieState || state !== cookieState) {
    console.error('[Shopify Callback Error] Invalid state. Expected:', !!cookieState, 'Got:', !!state);
    return NextResponse.redirect(new URL('/account?tab=orders&error=invalid_state', request.url));
  }

  const codeVerifier = request.cookies.get('shopify_pkce_verifier')?.value;
  if (!codeVerifier) {
    console.error('[Shopify Callback Error] Missing PKCE verifier cookie.');
    return NextResponse.redirect(new URL('/account?tab=orders&error=missing_verifier', request.url));
  }

  // Exchange code for tokens
  try {
    const tokenResponse = await fetch(`${shopifyAuthUrl}/auth/oauth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: clientId,
        redirect_uri: redirectUri,
        code: code,
        code_verifier: codeVerifier,
      }),
    });

    if (!tokenResponse.ok) {
      const errText = await tokenResponse.text();
      console.error('[Shopify OAuth Token Error]', errText);
      return NextResponse.redirect(new URL('/account?tab=orders&error=token_exchange_failed', request.url));
    }

    const tokens = await tokenResponse.json();
    console.log('[Shopify Callback] Token exchange successful! Access token received.');

    // Setup redirect response back to account orders
    const response = NextResponse.redirect(new URL('/account?tab=orders', request.url));

    // Store tokens securely (HttpOnly)
    const isProd = process.env.NODE_ENV === 'production';
    response.cookies.set('shopify_access_token', tokens.access_token, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'none' : 'lax', // Use 'none' in prod to survive cross-domain redirects
      maxAge: tokens.expires_in || 3600, // 1 hour
      path: '/',
    });

    if (tokens.refresh_token) {
      response.cookies.set('shopify_refresh_token', tokens.refresh_token, {
        httpOnly: true,
        secure: isProd,
        sameSite: isProd ? 'none' : 'lax',
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: '/',
      });
    }

    // Clear verification cookies
    response.cookies.delete('shopify_pkce_verifier');
    response.cookies.delete('shopify_oauth_state');

    return response;

  } catch (err) {
    console.error('[Shopify Callback Error]', err);
    return NextResponse.redirect(new URL('/account?tab=orders&error=server_error', request.url));
  }
}
