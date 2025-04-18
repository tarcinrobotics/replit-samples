import mongoose, { Schema, Document } from 'mongoose';

export interface ICourse extends Document {
  id: number;
  title: string;
  description: string;
  instructorId: number;
  duration: string;
  level: string;
  createdAt: Date;
}

const CourseSchema: Schema = new Schema({
  id: { type: Number, required: true, unique: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  instructorId: { type: Number, required: true },
  duration: { type: String, required: true },
  level: { type: String, required: true },
  status: { type: String, default: 'active' },
  createdAt: { type: Date, default: Date.now }
});

export const CourseModel = mongoose.model<ICourse>('Course', CourseSchema);
