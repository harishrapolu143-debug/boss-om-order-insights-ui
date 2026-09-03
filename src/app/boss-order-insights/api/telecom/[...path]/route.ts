import { NextRequest, NextResponse } from 'next/server';

// TELECOM_BACKEND_URL should point to your boss-wt backend, e.g. http://your-backend-host
// Set this in your .env.local: TELECOM_BACKEND_URL=http://192.168.86.1:8080
const TELECOM_BACKEND_URL = process.env.TELECOM_BACKEND_URL ?? '';

async function handler(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path } = await params;
    const pathStr = path.join('/');
    const url = new URL(request.url);
    // const backendUrl = `${TELECOM_BACKEND_URL}/api/telecom/${pathStr}${url.search}`;
    const backendUrl = `${TELECOM_BACKEND_URL}/watchtower_report/${pathStr}${url.search}`;
    const options: RequestInit = {
      method: request.method,
      headers: { 'Content-Type': 'application/json' },
    };

    if (['POST', 'PUT', 'PATCH'].includes(request.method)) {
      options.body = await request.text();
    }

    const response = await fetch(backendUrl, options);

    let data: unknown;
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Telecom Proxy Error]', message);
    return NextResponse.json(
      { success: false, error: 'PROXY_ERROR', message },
      { status: 502 }
    );
  }
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const DELETE = handler;
export const PATCH = handler;
