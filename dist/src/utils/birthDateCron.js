"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// birthdayCron.ts
const node_cron_1 = __importDefault(require("node-cron"));
const db_1 = require("../models/db"); // Your DB connection (e.g., Drizzle, Prisma, etc.)
const schema_1 = require("../models/schema"); // Adjust this to your ORM/DB schema
const firebase_1 = __importDefault(require("./firebase"));
const drizzle_orm_1 = require("drizzle-orm");
// Runs every day at 9:00 AM
node_cron_1.default.schedule("0 6 * * *", async () => {
    try {
        const today = new Date();
        const month = today.getMonth() + 1; // JS months are 0-based
        const day = today.getDate();
        const birthdayUsers = await db_1.db
            .select()
            .from(schema_1.users)
            .where((0, drizzle_orm_1.sql) `MONTH(${schema_1.users.dateOfBirth}) = ${month} AND DAY(${schema_1.users.dateOfBirth}) = ${day}`);
        for (const user of birthdayUsers) {
            if (user.fcmtoken) {
                await firebase_1.default.messaging().send({
                    token: user.fcmtoken,
                    notification: {
                        title: "🎉 Happy Birthday!",
                        body: `Happy Birthday, ${user.name}! 🎂`,
                    },
                    data: {
                        type: "BIRTHDAY",
                    },
                });
            }
        }
        console.log(`[Cron] Birthday notifications sent to ${birthdayUsers.length} users.`);
    }
    catch (error) {
        console.error(`[Cron Error]`, error);
    }
});
