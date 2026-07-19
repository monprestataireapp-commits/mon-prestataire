export async function storeImage(file: File): Promise<string> {
  const { put } = await import("@vercel/blob");
  const blob = await put(file.name, file, {
    access: "public",
    addRandomSuffix: true,
  });
  return blob.url;
}
