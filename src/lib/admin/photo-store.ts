import "server-only";
import { randomBytes } from "node:crypto";
import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import { join } from "node:path";
import sharp from "sharp";

// Listing photos. Every upload is re-encoded here: turned upright, resized to
// at most 1600px, saved as WebP, and stripped of metadata (phone photos carry
// the GPS position of wherever they were taken).
//
// Where they're kept:
// - Supabase Storage when SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set
//   (a public bucket, SUPABASE_PHOTO_BUCKET, default "listing-photos").
// - Otherwise, against a local database only, in .data/uploads, served by
//   /uploads/[name]. Hosted without Supabase, uploads are refused.

const MAX_INPUT_BYTES = 12 * 1024 * 1024;
export const MAX_PHOTOS = 8;
const LOCAL_DIR = join(process.cwd(), ".data", "uploads");
const NAME = /^[a-z0-9-]+\.webp$/;

function supabase() {
  const url = process.env.SUPABASE_URL?.replace(/\/$/, "");
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const bucket = process.env.SUPABASE_PHOTO_BUCKET || "listing-photos";
  return url && key ? { url, key, bucket } : null;
}

function localAllowed() {
  const url = process.env.DATABASE_URL;
  if (!url) return false;
  return ["localhost", "127.0.0.1", "db"].includes(new URL(url).hostname);
}

export class PhotoError extends Error {}

export async function storePhoto(file: File, listingSlug: string): Promise<string> {
  if (file.size === 0) throw new PhotoError("That file is empty.");
  if (file.size > MAX_INPUT_BYTES) throw new PhotoError("That photo is too large (12 MB at most).");

  let body: Buffer;
  try {
    const input = Buffer.from(await file.arrayBuffer());
    const { format } = await sharp(input).metadata();
    if (!format || !["jpeg", "png", "webp"].includes(format)) throw new PhotoError("Use a JPEG, PNG or WebP photo.");
    body = await sharp(input)
      .rotate()
      .resize(1600, 1600, { fit: "inside", withoutEnlargement: true })
      .webp({ quality: 82 })
      .toBuffer();
  } catch (error) {
    if (error instanceof PhotoError) throw error;
    throw new PhotoError("That file isn't a photo we can read.");
  }

  const name = `${listingSlug.slice(0, 50)}-${randomBytes(4).toString("hex")}.webp`;
  const remote = supabase();
  if (remote) {
    const response = await fetch(`${remote.url}/storage/v1/object/${remote.bucket}/${name}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${remote.key}`,
        "Content-Type": "image/webp",
        "Cache-Control": "31536000",
      },
      body: new Uint8Array(body),
    });
    if (!response.ok) throw new PhotoError("The photo couldn't be saved. Try again.");
    return `${remote.url}/storage/v1/object/public/${remote.bucket}/${name}`;
  }
  if (!localAllowed()) throw new PhotoError("Photo storage isn't set up yet (Supabase Storage).");
  await mkdir(LOCAL_DIR, { recursive: true });
  await writeFile(join(LOCAL_DIR, name), body);
  return `/uploads/${name}`;
}

/** Removes a stored photo; a photo that's already gone is fine. */
export async function deletePhoto(url: string) {
  const remote = supabase();
  const name = url.split("/").pop() ?? "";
  if (!NAME.test(name)) return;
  if (remote && url.startsWith(`${remote.url}/`)) {
    await fetch(`${remote.url}/storage/v1/object/${remote.bucket}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${remote.key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ prefixes: [name] }),
    }).catch(() => undefined);
  } else if (url.startsWith("/uploads/")) {
    await unlink(join(LOCAL_DIR, name)).catch(() => undefined);
  }
}

/** A locally stored photo, for /uploads/[name] (development only). */
export async function readLocalPhoto(name: string): Promise<Buffer | null> {
  if (!NAME.test(name) || !localAllowed()) return null;
  return readFile(join(LOCAL_DIR, name)).catch(() => null);
}
