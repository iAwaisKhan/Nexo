import { Schema, model, type InferSchemaType } from 'mongoose';

const userSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
      maxlength: 254,
    },
    passwordHash: { type: String, required: true, select: false },
    displayName: { type: String, trim: true, maxlength: 80, default: '' },
    avatarUrl: { type: String, default: '' },
  },
  { timestamps: true, versionKey: false },
);

export type UserRecord = InferSchemaType<typeof userSchema>;
export const UserModel = model('User', userSchema);
