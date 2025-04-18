import mongoose, { Schema, Document } from 'mongoose';

export interface IInstructor extends Document {
  id: number;
  userId: number;
  specialization: string;
  rating: number;
  status: string;
  createdAt: Date;
}

const InstructorSchema: Schema = new Schema({
  id: { type: Number, required: true, unique: true },
  userId: { type: Number, required: true },
  specialization: { type: String, required: true },
  rating: { type: Number, default: 0 },
  status: { type: String, default: 'active' },
  createdAt: { type: Date, default: Date.now }
});

export const InstructorModel = mongoose.model<IInstructor>('Instructor', InstructorSchema);
