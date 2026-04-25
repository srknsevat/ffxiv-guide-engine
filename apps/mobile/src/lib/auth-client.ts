export type LoginResult = Readonly<{
  accessToken: string;
}>;

export async function loginWithPassword(input: {
  apiBaseUrl: string;
  email: string;
  password: string;
}): Promise<LoginResult> {
  const response = await fetch(`${input.apiBaseUrl}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: input.email, password: input.password })
  });
  if (!response.ok) {
    throw new Error("Login failed");
  }
  return (await response.json()) as LoginResult;
}
