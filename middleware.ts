// middleware.ts
import { authMiddleware } from '@clerk/nextjs/server';

export default authMiddleware();

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};


// // middleware.ts
// import { authMiddleware } from "@clerk/nextjs";

// export default authMiddleware({
//   // Only the webhook is public now, remove "/"
//   publicRoutes: ["/api/webhook/clerk"],
// });

// export const config = {
//   // Keep your same matchers – but now "/" isn’t marked as “public”
//   matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
// };
