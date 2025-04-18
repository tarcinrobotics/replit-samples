import mongoose, { Schema, Document } from 'mongoose';

export interface IStudent extends Document {
  id: number;
  userId: number;
  progress: number;
  enrollmentDate: Date;
  status: string;
  createdAt: Date;
}

const StudentSchema: Schema = new Schema({
  id: { type: Number, required: true, unique: true },
  userId: { type: Number, required: true },
  progress: { type: Number, default: 0 },
  enrollmentDate: { type: Date, default: Date.now },
  status: { type: String, default: 'active' },
  createdAt: { type: Date, default: Date.now }
});

export const StudentModel = mongoose.model<IStudent>('Student', StudentSchema);
