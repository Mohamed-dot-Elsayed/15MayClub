import path from "path";
import fs from "fs";

export function saveBase64Image(base64: string, userId: string): string {
  const matches = base64.match(/^data:(.+);base64,(.+)$/);
  if (!matches || matches.length !== 3) {
    throw new Error("Invalid base64 format");
  }

  const ext = matches[1].split("/")[1];
  const buffer = Buffer.from(matches[2], "base64");

  const fileName = `${userId}.${ext}`;
  const uploadsDir = path.join(__dirname, "../..", "uploads");
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
  }

  const filePath = path.join(uploadsDir, fileName);
  fs.writeFileSync(filePath, buffer);

  return `/uploads/${fileName}`;
}
