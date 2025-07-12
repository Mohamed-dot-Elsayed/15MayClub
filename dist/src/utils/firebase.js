"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const firebase_admin_1 = __importDefault(require("firebase-admin"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const serviceAccountPath = path_1.default.join(__dirname, "mayclub-691bb-firebase-adminsdk-fbsvc-c6e9fe6d70.json");
// Ensure file exists before reading (avoid crash)
if (!fs_1.default.existsSync(serviceAccountPath)) {
    throw new Error("Firebase service account file not found");
}
const serviceAccount = JSON.parse(fs_1.default.readFileSync(serviceAccountPath, "utf-8"));
// Avoid initializing multiple times (important in dev/watch mode)
if (!firebase_admin_1.default.apps.length) {
    firebase_admin_1.default.initializeApp({
        credential: firebase_admin_1.default.credential.cert(serviceAccount),
    });
}
exports.default = firebase_admin_1.default;
