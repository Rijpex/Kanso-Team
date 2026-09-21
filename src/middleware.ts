import { NextResponse, type NextRequest } from "next/server";

// Snelle eerste controle; de echte controle (sessie in de database) gebeurt in de app-layout.
export function middleware(request: NextRequest) {
  if (!request.cookies.get("hub_session")) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}
export const config = { matcher: ["/app/:path*", "/api/files/:path*"] };
