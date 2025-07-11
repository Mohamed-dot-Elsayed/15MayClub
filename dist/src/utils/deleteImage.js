"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deletePhotoFromServer = void 0;
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const deletePhotoFromServer = async (relativePath) => {
    try {
        const filePath = path_1.default.join(__dirname, "..", "..", relativePath); // Adjust depth as needed
        try {
            await promises_1.default.access(filePath); // Check if file exists
        }
        catch {
            return false; // File not found
        }
        await promises_1.default.unlink(filePath); // Delete file
        return true;
    }
    catch (err) {
        console.error("Error deleting photo:", err);
        throw err;
    }
};
exports.deletePhotoFromServer = deletePhotoFromServer;
