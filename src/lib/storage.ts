import { supabaseAdmin } from "@/lib/supabase";
import { v4 as uuidv4 } from "uuid";
import fs from "fs";
import path from "path";

export interface StorageUploadOptions {
  bucket?: string;
  folder?: string;
  customFilename?: string;
}

export interface UploadResult {
  success: boolean;
  publicUrl: string;
  filename: string;
  storageType: "supabase" | "local";
}

/**
 * Uploads a single file to Supabase storage with automatic local filesystem fallback.
 */
export async function uploadFileToStorage(
  file: File,
  options: StorageUploadOptions = {}
): Promise<UploadResult> {
  const bucket = options.bucket || "products";
  const folder = options.folder || "";
  
  const safeOriginalName = file.name ? file.name.replace(/[^a-zA-Z0-9._-]/g, "_") : "file";
  const fileExt = safeOriginalName.split(".").pop() || "bin";
  const fileName = options.customFilename || `${uuidv4()}.${fileExt}`;
  
  let buffer: Buffer = Buffer.from("");
  if (Buffer.isBuffer(file)) {
    buffer = file;
  } else if (typeof file.arrayBuffer === "function") {
    try {
      const ab = await file.arrayBuffer();
      buffer = Buffer.from(ab);
    } catch {
      const text = typeof file.text === "function" ? await file.text() : "";
      buffer = Buffer.from(text);
    }
  } else if (typeof file.text === "function") {
    const text = await file.text();
    buffer = Buffer.from(text);
  }

  const relativeFilePath = folder ? `${folder}/${fileName}` : fileName;

  // 1. Try Supabase storage upload
  try {
    const { error } = await supabaseAdmin.storage
      .from(bucket)
      .upload(relativeFilePath, buffer, {
        contentType: file.type || "application/octet-stream",
        upsert: false,
      });

    if (!error) {
      const {
        data: { publicUrl },
      } = supabaseAdmin.storage.from(bucket).getPublicUrl(relativeFilePath);

      return {
        success: true,
        publicUrl,
        filename: fileName,
        storageType: "supabase",
      };
    }

    console.warn(
      `⚠️ Supabase storage upload to bucket '${bucket}' failed (${error.message}). Falling back to local filesystem storage.`
    );
  } catch (err: any) {
    console.warn(
      `⚠️ Supabase storage exception (${err?.message || err}). Falling back to local filesystem storage.`
    );
  }

  // 2. Fallback to local filesystem storage in public directory
  try {
    const localSubDir = bucket === "resumes" ? "resumes" : "uploads";
    const targetDir = path.join(process.cwd(), "public", localSubDir);

    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    const localFilePath = path.join(targetDir, fileName);
    fs.writeFileSync(localFilePath, buffer);

    const publicUrl = `/${localSubDir}/${fileName}`;

    return {
      success: true,
      publicUrl,
      filename: fileName,
      storageType: "local",
    };
  } catch (localErr: any) {
    console.error("Local storage fallback error:", localErr);
    throw new Error(`Failed to store uploaded file: ${localErr?.message || localErr}`);
  }
}

/**
 * Uploads multiple files to storage with automatic local fallback.
 */
export async function uploadFilesToStorage(
  files: File[],
  options: StorageUploadOptions = {}
): Promise<{ imageUrls: string[]; filenames: string[]; storageTypes: ("supabase" | "local")[] }> {
  const imageUrls: string[] = [];
  const filenames: string[] = [];
  const storageTypes: ("supabase" | "local")[] = [];

  for (const file of files) {
    const result = await uploadFileToStorage(file, options);
    imageUrls.push(result.publicUrl);
    filenames.push(result.filename);
    storageTypes.push(result.storageType);
  }

  return { imageUrls, filenames, storageTypes };
}
