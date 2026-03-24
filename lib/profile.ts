import { redirect } from "next/navigation";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Profile } from "@/types/profile";

export async function getOrCreateProfile() {
  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    redirect("/auth/login?next=/profiles");
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?next=/profiles");
  }

  const fallbackProfile: Profile = {
    id: user.id,
    email: user.email ?? null,
    display_name: null,
    created_at: user.created_at,
  };

  const { data: existingProfile, error: selectError } = await supabase
    .from("profiles")
    .select("id, email, display_name, created_at")
    .eq("id", user.id)
    .single();

  if (!selectError && existingProfile) {
    return existingProfile as Profile;
  }

  const { data, error } = await supabase
    .from("profiles")
    .insert({
      id: user.id,
      email: user.email ?? null,
    })
    .select("id, email, display_name, created_at")
    .single();

  if (error || !data) {
    return fallbackProfile;
  }

  return data as Profile;
}

export async function getProfileSummary() {
  const profile = await getOrCreateProfile();

  return {
    label: profile.display_name || profile.email || "Profile",
    profile,
  };
}
