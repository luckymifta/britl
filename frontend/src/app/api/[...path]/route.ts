import { NextRequest, NextResponse } from 'next/server';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const resolvedParams = await params;
  const path = resolvedParams.path.join('/');
  const url = new URL(request.url);
  
  try {
    const response = await fetch(`${API_BASE}/${path}${url.search}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // Forward cookies from the client
        'Cookie': request.headers.get('cookie') || '',
        // Forward authorization header if present
        ...(request.headers.get('authorization') && {
          'Authorization': request.headers.get('authorization')!
        })
      },
    });

    const data = await response.json();
    
    // Forward response headers
    const responseHeaders = new Headers();
    responseHeaders.set('Content-Type', 'application/json');
    
    // Forward Set-Cookie headers if present
    const setCookieHeader = response.headers.get('set-cookie');
    if (setCookieHeader) {
      responseHeaders.set('Set-Cookie', setCookieHeader);
    }

    return NextResponse.json(data, {
      status: response.status,
      headers: responseHeaders
    });
  } catch (error) {
    console.error('API proxy error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const resolvedParams = await params;
  const path = resolvedParams.path.join('/');
  
  try {
    let body;
    const contentType = request.headers.get('content-type');
    
    if (contentType?.includes('multipart/form-data')) {
      body = await request.formData();
    } else if (contentType?.includes('application/json')) {
      body = JSON.stringify(await request.json());
    } else {
      body = await request.text();
    }

    const response = await fetch(`${API_BASE}/${path}`, {
      method: 'POST',
      headers: {
        // Don't set Content-Type for FormData, let fetch set it
        ...(contentType?.includes('application/json') && {
          'Content-Type': 'application/json'
        }),
        // Forward cookies from the client
        'Cookie': request.headers.get('cookie') || '',
        // Forward authorization header if present
        ...(request.headers.get('authorization') && {
          'Authorization': request.headers.get('authorization')!
        })
      },
      body,
    });

    const data = await response.json();
    
    // Forward response headers
    const responseHeaders = new Headers();
    responseHeaders.set('Content-Type', 'application/json');
    
    // Forward Set-Cookie headers if present
    const setCookieHeader = response.headers.get('set-cookie');
    if (setCookieHeader) {
      responseHeaders.set('Set-Cookie', setCookieHeader);
    }

    return NextResponse.json(data, {
      status: response.status,
      headers: responseHeaders
    });
  } catch (error) {
    console.error('API proxy error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const resolvedParams = await params;
  const path = resolvedParams.path.join('/');
  
  try {
    const body = JSON.stringify(await request.json());

    const response = await fetch(`${API_BASE}/${path}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': request.headers.get('cookie') || '',
        ...(request.headers.get('authorization') && {
          'Authorization': request.headers.get('authorization')!
        })
      },
      body,
    });

    const data = await response.json();
    
    return NextResponse.json(data, {
      status: response.status
    });
  } catch (error) {
    console.error('API proxy error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const resolvedParams = await params;
  const path = resolvedParams.path.join('/');
  
  try {
    const response = await fetch(`${API_BASE}/${path}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': request.headers.get('cookie') || '',
        ...(request.headers.get('authorization') && {
          'Authorization': request.headers.get('authorization')!
        })
      },
    });

    const data = await response.json();
    
    return NextResponse.json(data, {
      status: response.status
    });
  } catch (error) {
    console.error('API proxy error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
