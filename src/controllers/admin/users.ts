import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { db } from "../../models/db";
import { users } from "../../models/schema";
import { eq } from "drizzle-orm";
import { SuccessResponse } from "../../utils/response";
import { NotFound } from "../../Errors";
import { saveBase64Image } from "../../utils/handleImages";
import { sendEmail } from "../../utils/sendEmails";

export const getAllUsers = async (req: Request, res: Response) => {
  const allUsers = await db.select().from(users);
  SuccessResponse(res, { users: allUsers }, 200);
};

export const getUser = async (req: Request, res: Response) => {
  const id = req.params.id;
  const [user] = await db.select().from(users).where(eq(users.id, id));

  if (!user) throw new NotFound("User not found");

  SuccessResponse(res, user, 200);
};

export const updateUser = async (req: Request, res: Response) => {
  const id = req.params.id;
  const newUser = req.body;

  const [user] = await db.select().from(users).where(eq(users.id, id)).limit(1);
  if (!user) throw new NotFound("User not found");

  if (newUser !== undefined && Object.keys(newUser).length > 0) {
    if (newUser.password) {
      newUser.password = await bcrypt.hash(newUser.password, 10);
    }
    const updates: any = {};
    if (newUser.password) updates.hashedPassword = newUser.password;
    if (newUser.role) updates.role = newUser.role;
    if (newUser.name) updates.name = newUser.name;
    if (newUser.email) updates.email = newUser.email;
    if (newUser.role) updates.role = newUser.role;
    if (newUser.phoneNumber) updates.phoneNumber = newUser.phoneNumber;
    if (newUser.dateOfBirth)
      updates.dateOfBirth = new Date(newUser.dateOfBirth);
    if (newUser.imageBase64)
      updates.image_path = saveBase64Image(newUser.imageBase64, user.id);
    console.log("Updates:", updates);

    if (updates === undefined || Object.keys(updates).length === 0) {
      SuccessResponse(res, { message: "User Updated successfully" }, 200);
      return;
    }
    const result = await db.update(users).set(updates).where(eq(users.id, id));
  }

  SuccessResponse(res, { message: "User Updated successfully" }, 200);
};

export const deleteUser = async (req: Request, res: Response) => {
  const id = req.params.id;
  const [user] = await db.select().from(users).where(eq(users.id, id));
  if (!user) throw new NotFound("User not found");

  await db.delete(users).where(eq(users.id, id));

  SuccessResponse(res, { message: "User deleted successfully" }, 200);
};

export const approveUser = async (req: Request, res: Response) => {
  const id = req.params.id;
  const [user] = await db.select().from(users).where(eq(users.id, id));
  if (!user) throw new NotFound("User not found");
  const result = await db
    .update(users)
    .set({ status: "approved", updatedAt: new Date() })
    .where(eq(users.id, id));
  await sendEmail(
    user.email,
    "Your account has been approved",
    "Congratulations! Your account has been approved by the admin. You can now log in and start using our services."
  );
  SuccessResponse(res, { message: "User approved successfully" }, 200);
};

export const rejectUser = async (req: Request, res: Response) => {
  const id = req.params.id;
  const { rejectionReason } = req.body;
  const [user] = await db.select().from(users).where(eq(users.id, id));
  if (!user) throw new NotFound("User not found");
  const result = await db
    .update(users)
    .set({
      status: "rejected",
      updatedAt: new Date(),
      rejectionReason: rejectionReason,
    })
    .where(eq(users.id, id));
  await sendEmail(
    user.email,
    "Your account has been Rejected",
    "Unfortunately, your account was rejected."
  );
  SuccessResponse(res, { message: "User rejected successfully" }, 200);
};

export const getAllRejectedUsers = async (req: Request, res: Response) => {
  const allRejectedUsers = await db
    .select()
    .from(users)
    .where(eq(users.status, "rejected"));
  SuccessResponse(res, { users: allRejectedUsers }, 200);
};

export const getAllPendingUsers = async (req: Request, res: Response) => {
  const allRejectedUsers = await db
    .select()
    .from(users)
    .where(eq(users.status, "pending"));
  SuccessResponse(res, { users: allRejectedUsers }, 200);
};
