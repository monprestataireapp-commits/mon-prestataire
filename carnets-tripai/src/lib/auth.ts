import { cookies } from "next/headers";

const SESSION_NAME = "carnets-admin";

export async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_NAME)?.value === "1";
}

export function checkPassword(password: string): boolean {
  return password === process.env.ADMIN_PASSWORD;
}

export { SESSION_NAME };
