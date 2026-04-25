"use client";

import { PageShell } from "@ffxiv-guide-engine/ui";
import { useRouter } from "next/navigation";
import type { FormEvent, ReactElement } from "react";
import { useState } from "react";
import { getApiBaseUrl } from "@/lib/api-base-url";

export default function LoginPage(): ReactElement {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const onSubmit = async (event: FormEvent): Promise<void> => {
    event.preventDefault();
    setErrorMessage(null);
    const response = await fetch(`${getApiBaseUrl()}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });
    if (!response.ok) {
      setErrorMessage("Login failed.");
      return;
    }
    const body = (await response.json()) as { accessToken: string };
    localStorage.setItem("accessToken", body.accessToken);
    router.push("/dashboard");
  };
  return (
    <PageShell
      eyebrow="Operations console"
      title="Admin login"
      subtitle="Review scraper jobs, publish draft intel, and monitor source health from one control room."
    >
      <section className="hero-panel">
        <div className="hero-content">
          <p className="eyebrow">Secure access</p>
          <h2>Enter the command deck</h2>
          <p>Use the bootstrap admin account created during local server deployment.</p>
        </div>
        <form onSubmit={(e) => void onSubmit(e)}>
          <label>
            Email
            <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />
          </label>
          <label>
            Password
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              required
            />
          </label>
          <button type="submit">Sign in</button>
        </form>
      </section>
      {errorMessage ? <p role="alert">{errorMessage}</p> : null}
    </PageShell>
  );
}
