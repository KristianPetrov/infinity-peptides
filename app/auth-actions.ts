"use server";

import { redirect } from "next/navigation";
import { clearSession } from "@/lib/auth/session";
import { loginWithCredentials, registerCustomer } from "@/lib/auth/service";

export async function loginAction(formData: FormData) {
  const result = await loginWithCredentials(
    {
      email: String(formData.get("email") || ""),
      password: String(formData.get("password") || ""),
    },
    String(formData.get("redirectTo") || ""),
  );

  if (!result.ok) {
    redirect(`/login?error=${encodeURIComponent(result.error)}`);
  }

  redirect(result.redirectTo);
}

export async function registerAction(formData: FormData) {
  const result = await registerCustomer({
    name: String(formData.get("name") || ""),
    email: String(formData.get("email") || ""),
    password: String(formData.get("password") || ""),
  });

  if (!result.ok) {
    redirect(`/register?error=${encodeURIComponent(result.error)}`);
  }

  redirect(result.redirectTo);
}

export async function logoutAction() {
  await clearSession();
  redirect("/login");
}
