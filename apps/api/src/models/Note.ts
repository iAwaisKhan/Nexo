import { Schema, model, type InferSchemaType } from 'mongoose';

const noteSchema = new Schema(
  {
    _id: { type: String, required: true },
    ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, maxlength: 255, default: '' },
    content: { type: String, required: true, default: '' },
    tags: { type: [String], default: [] },
    isPinned: { type: Boolean, default: false },
    isPublic: { type: Boolean, default: false },
    publishedAt: { type: Number, default: null },
    slug: { type: String, maxlength: 160, default: null },
    isBlog: { type: Boolean, default: false },
    timeSpent: { type: Number, min: 0, default: 0 },
    version: { type: Number, min: 1, default: 1 },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true, versionKey: false, _id: false },
);

noteSchema.index({ ownerId: 1, updatedAt: -1, _id: -1 });
noteSchema.index({ ownerId: 1, tags: 1 });
noteSchema.index({ ownerId: 1, isPinned: -1, updatedAt: -1 });
noteSchema.index({ isPublic: 1, deletedAt: 1, _id: 1 });

export type NoteRecord = InferSchemaType<typeof noteSchema>;
export const NoteModel = model('Note', noteSchema);
