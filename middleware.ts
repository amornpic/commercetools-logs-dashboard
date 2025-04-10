import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const USER = process.env.BASIC_AUTH_USER;
const PASS = process.env.BASIC_AUTH_PASSWORD;

export function middleware(req: NextRequest) {
    if (process.env.NODE_ENV === 'production') {
        const authHeader = req.headers.get('authorization');
    
        if (authHeader) {
            const base64Credentials = authHeader.split(' ')[1];
            const credentials = atob(base64Credentials).split(':');
            const [user, pass] = credentials;

            if (user === USER && pass === PASS) {
            return NextResponse.next();
            }
        }

        return new NextResponse('Unauthorized', {
            status: 401,
            headers: {
            'WWW-Authenticate': 'Basic realm="Secure Area"',
            },
        });
    }

    return NextResponse.next();;
}
