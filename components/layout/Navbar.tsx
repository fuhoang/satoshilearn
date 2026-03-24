import { getAuthenticatedUser } from "@/lib/auth";
import { getProfileSummary } from "@/lib/profile";

import { NavbarClient } from "@/components/layout/NavbarClient";

export async function Navbar() {
  const user = await getAuthenticatedUser();
  const profileSummary = user ? await getProfileSummary() : null;

  return (
    <NavbarClient
      isAuthenticated={Boolean(user)}
      userLabel={profileSummary?.label ?? user?.email ?? null}
    />
  );
}
