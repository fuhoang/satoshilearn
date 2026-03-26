import { unstable_noStore as noStore } from "next/cache";

import { getAuthenticatedUser } from "@/lib/auth";
import { getAccountStatusForCurrentUser } from "@/lib/account-status";
import { getProfileSummary } from "@/lib/profile";

import { NavbarClient } from "@/components/layout/NavbarClient";

export async function Navbar() {
  noStore();

  const user = await getAuthenticatedUser();
  const [profileSummary, accountStatus] = user
    ? await Promise.all([
        getProfileSummary(),
        getAccountStatusForCurrentUser(),
      ])
    : [null, null];

  return (
    <NavbarClient
      accountStatus={accountStatus}
      avatarUrl={profileSummary?.profile.avatar_url ?? null}
      isAuthenticated={Boolean(user)}
      userLabel={profileSummary?.label ?? user?.email ?? null}
    />
  );
}
