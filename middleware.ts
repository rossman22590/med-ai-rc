// middleware.ts
import { authMiddleware } from "@clerk/nextjs";

export default authMiddleware({
  // Only the webhook is public now, remove "/"
  publicRoutes: ["/api/webhook/clerk"],
});

export const config = {
  // Keep your same matchers – but now "/" isn’t marked as “public”
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
