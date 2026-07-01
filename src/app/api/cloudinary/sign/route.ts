import { NextResponse } from "next/server";
import { getCloudinaryUploadSignature } from "@/lib/cloudinary";
import { requireCurrentUser } from "@/lib/supabase/server";

export async function POST() {
  await requireCurrentUser();

  return NextResponse.json(getCloudinaryUploadSignature());
}
