import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { uploadFileToStorage, uploadFilesToStorage } from "./storage";
import fs from "fs";
import path from "path";

const createTestFile = (content: string, name: string, type = "image/png"): File => {
  const blob = new Blob([content], { type });
  const file = new File([blob], name, { type });
  (file as any).arrayBuffer = async () => {
    const buf = Buffer.from(content);
    return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
  };
  return file;
};

describe("uploadFileToStorage", () => {
  const testFileName = "test-image-unit.png";
  let createdFilePath: string | null = null;

  afterEach(() => {
    if (createdFilePath && fs.existsSync(createdFilePath)) {
      try {
        fs.unlinkSync(createdFilePath);
      } catch {
        // Ignore cleanup errors
      }
    }
  });

  it("should upload file to local storage when Supabase fails or is unconfigured", async () => {
    const fileContent = "fake-png-content";
    const file = createTestFile(fileContent, testFileName);

    const result = await uploadFileToStorage(file, {
      bucket: "products",
      folder: "uploads",
      customFilename: testFileName,
    });

    expect(result.success).toBe(true);
    expect(result.filename).toBe(testFileName);
    expect(result.publicUrl).toBe(`/uploads/${testFileName}`);

    createdFilePath = path.join(process.cwd(), "public", "uploads", testFileName);
    expect(fs.existsSync(createdFilePath)).toBe(true);

    const savedContent = fs.readFileSync(createdFilePath, "utf-8");
    expect(savedContent).toBe(fileContent);
  });

  it("should handle uploading multiple files", async () => {
    const file1Name = "test-multi-1.png";
    const file2Name = "test-multi-2.png";

    const file1 = createTestFile("content1", file1Name);
    const file2 = createTestFile("content2", file2Name);

    const results = await uploadFilesToStorage([file1, file2], {
      bucket: "products",
    });

    expect(results.imageUrls.length).toBe(2);
    expect(results.filenames.length).toBe(2);

    const path1 = path.join(process.cwd(), "public", "uploads", results.filenames[0]);
    const path2 = path.join(process.cwd(), "public", "uploads", results.filenames[1]);

    if (fs.existsSync(path1)) fs.unlinkSync(path1);
    if (fs.existsSync(path2)) fs.unlinkSync(path2);
  });
});
