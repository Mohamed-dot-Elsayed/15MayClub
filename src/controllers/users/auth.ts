import { Request, Response } from "express";
import { saveBase64Image } from "../../utils/handleImages";
import { db } from "../../models/db";
import { users } from "../../models/schema";
import { eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcrypt";
import { SuccessResponse } from "../../utils/response";
import {
  ForbiddenError,
  UnauthorizedError,
  UniqueConstrainError,
} from "../../Errors";
import { generateToken } from "../../utils/auth";
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

  const hashedPassword = await bcrypt.hash(data.password, 10);
  const userId = uuidv4();

  let imagePath: string | null = null;

  if (data.role === "member") {
    imagePath = saveBase64Image(data.imageBase64!, userId);
  }

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

  SuccessResponse(res, { message: "User Signup successfully" }, 201);
}

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

  const token = generateToken({
    id: user.id,
    name: user.name,
    role: user.role,
  });

  SuccessResponse(res, { message: "login Successful", tokne: token }, 200);
}
