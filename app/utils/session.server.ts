import { createCookieSessionStorage } from "@remix-run/node";

const sessionSecret = process.env.SESSION_SECRET;
if (!sessionSecret) {
  throw new Error("SESSION_SECRET must be set");
}

export const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: "__session",
    secure: process.env.NODE_ENV === "production",
    secrets: [sessionSecret],
    sameSite: "lax",
    path: "/",
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 30, // 30 days
  },
});

export const { getSession, commitSession, destroySession } = sessionStorage;

// Function to sign out a user
export const signOut = async (request: Request) => {
  const session = await getSession(request.headers.get("Cookie"));
  return destroySession(session);
};
