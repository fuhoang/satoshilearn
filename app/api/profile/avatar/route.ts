import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";

import { createServerSupabaseClient } from "@/lib/supabase/server";

const MAX_AVATAR_SIZE = 2 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

function sanitizeFilename(filename: string) {
  return filename.toLowerCase().replace(/[^a-z0-9.-]+/g, "-");
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
    return NextResponse.json(
      { error: "Unable to upload your avatar right now." },
      { status: 500 },
    );
  }

  const { data } = supabase.storage.from("avatars").getPublicUrl(path);

  return NextResponse.json({
    avatarUrl: data.publicUrl,
    path,
  });
}
