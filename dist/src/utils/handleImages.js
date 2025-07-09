"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveBase64Image = saveBase64Image;
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
function saveBase64Image(base64, userId) {
    const matches = base64.match(/^data:(.+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
        throw new Error("Invalid base64 format");
    }
    const ext = matches[1].split("/")[1];
    const buffer = Buffer.from(matches[2], "base64");
    const fileName = `${userId}.${ext}`;
    const uploadsDir = path_1.default.join(__dirname, "..", "uploads");
    if (!fs_1.default.existsSync(uploadsDir)) {
        fs_1.default.mkdirSync(uploadsDir);
    }
    const filePath = path_1.default.join(uploadsDir, fileName);
    fs_1.default.writeFileSync(filePath, buffer);
    return `/uploads/${fileName}`;
}
