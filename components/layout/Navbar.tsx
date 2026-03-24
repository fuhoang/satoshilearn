import { getAuthenticatedUser } from "@/lib/auth";

import { NavbarClient } from "@/components/layout/NavbarClient";

export async function Navbar() {
  const user = await getAuthenticatedUser();

  return (
    <NavbarClient
      isAuthenticated={Boolean(user)}
      userLabel={user?.email ?? null}
    />
  );
}
