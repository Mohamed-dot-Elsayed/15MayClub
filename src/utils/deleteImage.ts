import fs from "fs/promises";
import path from "path";

export const deletePhotoFromServer = async (
  relativePath: string
): Promise<boolean> => {
  try {
    const filePath = path.join(__dirname, "..", "..", relativePath); // Adjust depth as needed

    try {
      await fs.access(filePath); // Check if file exists
    } catch {
      return false; // File not found
    }

    await fs.unlink(filePath); // Delete file
    return true;
  } catch (err) {
    console.error("Error deleting photo:", err);
    throw err;
  }
};
