export async function storeImage(file: File): Promise<string> {
  if (process.env.BLOB_READ_WRITE_TOKEN || process.env.VERCEL) {
    const { put } = await import("@vercel/blob");
    const blob = await put(file.name, file, {
      access: "public",
      addRandomSuffix: true,
    });
    return blob.url;
  }
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const fs = await import("fs/promises");
  const path = await import("path");
  const uploadDir = path.join(process.cwd(), "public", "uploads");
  await fs.mkdir(uploadDir, { recursive: true });
  const filename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
  await fs.writeFile(path.join(uploadDir, filename), buffer);
  return `/uploads/${filename}`;
}
