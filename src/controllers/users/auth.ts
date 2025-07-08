import { Request, Response } from "express";
import { saveBase64Image } from "../../utils/handleImages";
import { db } from "../../models/db";
import { emailVerifications, users } from "../../models/schema";
import { eq, or } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcrypt";
import { SuccessResponse } from "../../utils/response";
import { randomInt } from "crypto";
import {
  ForbiddenError,
  NotFound,
  UnauthorizedError,
  UniqueConstrainError,
} from "../../Errors";
import { generateToken } from "../../utils/auth";
import { sendEmail } from "../../utils/sendEmails";
import { BadRequest } from "../../Errors/BadRequest";

export async function signup(req: Request, res: Response) {
  const data = req.body;

  const existing = await db
    .select()
    .from(users)
    .where(eq(users.email, data.email));
  if (existing.length > 0) {
    throw new UniqueConstrainError(
      "Email",
      "User already signup with this email"
    );
  }
  const existingNumber = await db
    .select()
    .from(users)
    .where(eq(users.phoneNumber, data.phoneNumber));
  if (existingNumber.length > 0) {
    throw new UniqueConstrainError(
      "Phone Number",
      "User already signup with this Phone Number"
    );
  }

  const hashedPassword = await bcrypt.hash(data.password, 10);
  const userId = uuidv4();

  let imagePath: string | null = null;

  if (data.role === "member") {
    imagePath = saveBase64Image(data.imageBase64!, userId);
  }
  const code = randomInt(100000, 999999).toString();

  await db.insert(users).values({
    id: userId,
    name: data.name,
    phoneNumber: data.phoneNumber,
    role: data.role,
    email: data.email,
    hashedPassword,
    purpose: data.role === "guest" ? data.purpose : null,
    imagePath,
    dateOfBirth: new Date(data.dateOfBirth),
    status: "pending",
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  await db.insert(emailVerifications).values({
    userId: userId,
    code,
  });

  await sendEmail(
    data.email,
    "Email Verification",
    `Your verification code is ${code}`
  );

  SuccessResponse(
    res,
    {
      message: "User Signup successfully get verification code from gmail",
      id: userId,
    },
    201
  );
}

export const verifyEmail = async (req: Request, res: Response) => {
  const { userId, code } = req.body;

  const user = await db.query.users.findFirst({
    where: (u, { eq }) => eq(u.id, userId),
  });

  if (!user) throw new NotFound("User not found");

  const record = await db.query.emailVerifications.findFirst({
    where: (ev, { eq }) => eq(ev.userId, user.id),
  });

  if (!record || record.code !== code)
    throw new BadRequest("Invalid verification code");

  await db.update(users).set({ isVerified: true }).where(eq(users.id, user.id));
  await db
    .delete(emailVerifications)
    .where(eq(emailVerifications.userId, user.id));

  res.json({ message: "Email verified successfully" });
};

export async function login(req: Request, res: Response) {
  const data = req.body;

  const user = await db.query.users.findFirst({
    where: eq(users.email, data.email),
  });

  if (!user) {
    throw new UnauthorizedError("Invalid email or password");
  }

  const isMatch = await bcrypt.compare(data.password, user.hashedPassword);
  if (!isMatch) {
    throw new UnauthorizedError("Invalid email or password");
  }

  if (user.status !== "approved") {
    throw new ForbiddenError(
      "Your account is not approved yet. Please wait for approval."
    );
  }

  if (!user.isVerified) {
    throw new ForbiddenError("Verify your email first");
  }

  const token = generateToken({
    id: user.id,
    name: user.name,
    role: "approved_user",
  });

  SuccessResponse(res, { message: "login Successful", tokne: token }, 200);
}

export const getFcmToken = async (req: Request, res: Response) => {
  const { token } = req.body;
  const userId = req.user!.id; // from auth middleware

  await db.update(users).set({ fcmtoken: token }).where(eq(users.id, userId));
  res.json({ success: true });
};

export const sendResetCode = async (req: Request, res: Response) => {
  const { email } = req.body;

  const [user] = await db.select().from(users).where(eq(users.email, email));

  if (!user) throw new NotFound("User not found");

  const code = Math.floor(100000 + Math.random() * 900000).toString();

  await db
    .insert(emailVerifications)
    .values({ code: code, createdAt: new Date(), userId: user.id });
  await sendEmail(
    email,
    "Password Reset Code",
    `Your reset code is: ${code}\nIt will expire in 10 minutes.`
  );

  SuccessResponse(res, { message: "Reset code sent to your email" }, 200);
};

export const resetPassword = async (req: Request, res: Response) => {
  const { email, code, newPassword } = req.body;

  const [user] = await db.select().from(users).where(eq(users.email, email));
  const [rowcode] = await db
    .select()
    .from(emailVerifications)
    .where(eq(emailVerifications.userId, user.id));
  if (!user || rowcode.code !== code) {
    throw new BadRequest("Invalid email or reset code");
  }

  const hashed = await bcrypt.hash(newPassword, 10);

  await db
    .update(users)
    .set({ hashedPassword: hashed })
    .where(eq(users.id, user.id));

  await db
    .delete(emailVerifications)
    .where(eq(emailVerifications.userId, user.id));

  SuccessResponse(res, { message: "Password reset successfully" }, 200);
};
