import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";

import { getSupabaseBrowserEnv } from "@/lib/supabase/config";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const MAX_AVATAR_SIZE = 2 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

function sanitizeFilename(filename: string) {
  return filename.toLowerCase().replace(/[^a-z0-9.-]+/g, "-");
}

function getAvatarStoragePath(avatarUrl: string, userId: string) {
  try {
    const url = new URL(avatarUrl);
    const supabaseEnv = getSupabaseBrowserEnv();

    if (supabaseEnv && url.origin !== new URL(supabaseEnv.url).origin) {
      return null;
    }

    const marker = "/storage/v1/object/public/avatars/";
    const markerIndex = url.pathname.indexOf(marker);

    if (markerIndex === -1) {
      return null;
    }

    const path = decodeURIComponent(
      url.pathname.slice(markerIndex + marker.length),
    );

    if (!path.startsWith(`${userId}/`)) {
      return null;
    }

    return path;
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return NextResponse.json(
      { error: "Supabase is not configured." },
      { status: 500 },
    );
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: "You must be logged in to upload an avatar." },
      { status: 401 },
    );
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json(
      { error: "Choose an image before uploading." },
      { status: 400 },
    );
  }

  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    return NextResponse.json(
      { error: "Avatar images must be JPG, PNG, or WebP." },
      { status: 400 },
    );
  }

  if (file.size > MAX_AVATAR_SIZE) {
    return NextResponse.json(
      { error: "Avatar images must be 2MB or smaller." },
      { status: 400 },
    );
  }

  const extension = file.name.includes(".")
    ? file.name.split(".").pop()
    : file.type.split("/").pop();
  const path = `${user.id}/${randomUUID()}-${sanitizeFilename(file.name || `avatar.${extension ?? "png"}`)}`;

  const { error: uploadError } = await supabase.storage
    .from("avatars")
    .upload(path, file, {
      contentType: file.type,
      upsert: false,
    });

  if (uploadError) {
    const message =
      /bucket/i.test(uploadError.message) || /row-level security|policy/i.test(uploadError.message)
        ? "Avatar storage is not fully configured in Supabase yet. Rerun supabase/schema.sql and try again."
        : "Unable to upload your avatar right now.";

    return NextResponse.json(
      { error: message },
      { status: 500 },
    );
  }

  const { data } = supabase.storage.from("avatars").getPublicUrl(path);

  return NextResponse.json({
    avatarUrl: data.publicUrl,
    path,
  });
}

export async function DELETE(request: Request) {
  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return NextResponse.json(
      { error: "Supabase is not configured." },
      { status: 500 },
    );
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: "You must be logged in to remove an avatar." },
      { status: 401 },
    );
  }

  const body = (await request.json()) as { avatarUrl?: unknown };

  if (typeof body.avatarUrl !== "string" || body.avatarUrl.trim().length === 0) {
    return NextResponse.json(
      { error: "Choose an avatar to remove first." },
      { status: 400 },
    );
  }

  const path = getAvatarStoragePath(body.avatarUrl, user.id);

  if (!path) {
    return NextResponse.json(
      { error: "That avatar does not belong to this account." },
      { status: 400 },
    );
  }

  const { error } = await supabase.storage.from("avatars").remove([path]);

  if (error) {
    return NextResponse.json(
      { error: "Unable to remove your avatar right now." },
      { status: 500 },
    );
  }

  return NextResponse.json({ removed: true });
}
