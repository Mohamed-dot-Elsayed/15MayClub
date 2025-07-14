import { Request, Response } from "express";
import { saveBase64Image } from "../../utils/handleImages";
import { db } from "../../models/db";
import { emailVerifications, users } from "../../models/schema";
import { eq, and, or } from "drizzle-orm";
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

export const signup = async (req: Request, res: Response) => {
  const data = req.body;

  const [existing] = await db
    .select()
    .from(users)
    .where(
      or(eq(users.email, data.email), eq(users.phoneNumber, data.phoneNumber))
    );
  if (existing) {
    if (existing.email === data.email)
      throw new UniqueConstrainError(
        "Email",
        "User already signup with this email"
      );
    if (existing.phoneNumber === data.phoneNumber)
      throw new UniqueConstrainError(
        "Phone Number",
        "User already signup with this phone number"
      );
  }
  const hashedPassword = await bcrypt.hash(data.password, 10);
  const userId = uuidv4();

  let imagePath: string | null = null;

  if (data.role === "member") {
    imagePath = await saveBase64Image(data.imageBase64!, userId, req, "users");
  }
  const code = randomInt(100000, 999999).toString();

  const newUse: any = {
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
    createdAt: new Date(new Date().getTime() + 3 * 60 * 60 * 1000), // Adjusting for timezone
    updatedAt: new Date(new Date().getTime() + 3 * 60 * 60 * 1000), // Adjusting for timezone
  };

  if (!req.user) {
    await db.insert(emailVerifications).values({
      userId: userId,
      code,
    });
    await sendEmail(
      data.email,
      "Email Verification",
      `Your verification code is ${code}`
    );
  } else {
    newUse.status = "approved";
    newUse.isVerified = true;
  }
  await db.insert(users).values(newUse);

  SuccessResponse(
    res,
    {
      message: "User Signup successfully get verification code from gmail",
      userId: userId,
    },
    201
  );
};

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

export const login = async (req: Request, res: Response) => {
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
    role:
      user.role === "member" ? "approved_member_user" : "approved_guest_user",
  });

  SuccessResponse(res, { message: "login Successful", tokne: token }, 200);
};

export const getFcmToken = async (req: Request, res: Response) => {
  const { token } = req.body;
  const userId = req.user!.id;

  await db.update(users).set({ fcmtoken: token }).where(eq(users.id, userId));
  res.json({ success: true });
};

export const sendResetCode = async (req: Request, res: Response) => {
  const { email } = req.body;

  const [user] = await db.select().from(users).where(eq(users.email, email));

  if (!user) throw new NotFound("User not found");
  if (!user.isVerified || user.status !== "approved")
    throw new BadRequest("User is not verified or approved");
  const code = Math.floor(100000 + Math.random() * 900000).toString();

  await db
    .delete(emailVerifications)
    .where(eq(emailVerifications.userId, user.id));

  await db
    .insert(emailVerifications)
    .values({ code: code, createdAt: new Date(), userId: user.id });
  await sendEmail(
    email,
    "Password Reset Code",
    `Your reset code is: ${code}\nIt will expire in 2 hours.`
  );

  SuccessResponse(res, { message: "Reset code sent to your email" }, 200);
};

export const verifyCode = async (req: Request, res: Response) => {
  const { email, code } = req.body;
  const [user] = await db.select().from(users).where(eq(users.email, email));
  const [rowcode] = await db
    .select()
    .from(emailVerifications)
    .where(eq(emailVerifications.userId, user.id));
  if (!user || rowcode.code !== code) {
    throw new BadRequest("Invalid email or reset code");
  }
  SuccessResponse(res, { message: "Code verified successfully" }, 200);
};

export const resetPassword = async (req: Request, res: Response) => {
  const { email, code, newPassword } = req.body;

  const [user] = await db.select().from(users).where(eq(users.email, email));
  if (!user) throw new NotFound("User not found");
  const [rowcode] = await db
    .select()
    .from(emailVerifications)
    .where(
      and(
        eq(emailVerifications.userId, user.id),
        eq(emailVerifications.code, code)
      )
    );
  if (!rowcode) throw new BadRequest("Invalid reset code");

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
