// import { NextResponse } from "next/server";

// export function middleware(request) {
//   // Get the pathname from the request
//   const { pathname } = request.nextUrl;
  
//   // Only apply protection to admin routes
//   if (pathname.startsWith("/admin")) {
//     // Check for authentication tokens in cookies
//     const accessToken = request.cookies.get("access_token")?.value;
    
//     // If no access token is present, redirect to login
//     if (!accessToken) {
//       const url = new URL("/login", request.url);
//       url.searchParams.set("from", pathname);
//       return NextResponse.redirect(url);
//     }
    
//     // For admin routes, check if user has admin role from local storage
//     // Since middleware can't access localStorage directly, we'll rely on the user cookie
//     try {
//       const userCookie = request.cookies.get("user")?.value;
      
//       // If there's no user cookie, we can't verify admin status,
//       // so redirect to login as a fallback
//       if (!userCookie) {
//         const url = new URL("/login", request.url);
//         url.searchParams.set("from", pathname);
//         return NextResponse.redirect(url);
//       }
      
//       const userData = JSON.parse(decodeURIComponent(userCookie));
      
//       // Check if user has admin role
//       if (!userData) {
//         // User is authenticated but not an admin, redirect to dashboard
//         return NextResponse.redirect(new URL("/", request.url));
//       }
//     } catch (error) {
//       // If there's an error parsing the user data, redirect to login
//       console.error("Error in admin route check:", error);
//       return NextResponse.redirect(new URL("/login", request.url));
//     }
//   }
  
//   // Allow all other routes to pass through
//   return NextResponse.next();
// }

// export const config = {
//   matcher: [
//     // Only match admin routes
//     "/admin/:path*",
//   ],
// };

import { NextResponse } from "next/server";

export function middleware(request) {
  const { pathname } = request.nextUrl;
  console.log('Middleware processing:', pathname); // Debug log

  // Only check for admin routes
  if (pathname.startsWith("/admin")) {
    console.log('Admin route detected'); // Debug log
    
    const accessToken = request.cookies.get("access_token")?.value;
    console.log('Access token:', accessToken ? 'exists' : 'missing'); // Debug log

    // If no access token, redirect to login
    if (!accessToken) {
      console.log('Redirecting to login (no access token)'); // Debug log
      const url = new URL("/login", request.url);
      url.searchParams.set("from", pathname);
      return NextResponse.redirect(url);
    }

    // Verify user cookie exists (simplified since all logged-in users are admins)
    const userCookie = request.cookies.get("user")?.value;
    if (!userCookie) {
      console.log('Redirecting to login (no user cookie)'); // Debug log
      const url = new URL("/login", request.url);
      url.searchParams.set("from", pathname);
      return NextResponse.redirect(url);
    }

    console.log('Admin route access granted'); // Debug log
  }
  
  console.log('Allowing request to continue'); // Debug log
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Explicitly only match admin routes
    "/admin/:path*",
    // Make sure there are no other matchers here
  ],
};

