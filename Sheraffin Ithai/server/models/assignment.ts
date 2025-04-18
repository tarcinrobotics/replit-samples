import mongoose, { Schema, Document } from 'mongoose';

export interface IAssignment extends Document {
  id: number;
  title: string;
  courseId: number;
  dueDate: Date;
  points: number;
  status: string;
  createdAt: Date;
}

const AssignmentSchema: Schema = new Schema({
  id: { type: Number, required: true, unique: true },
  title: { type: String, required: true },
  courseId: { type: Number, required: true },
  dueDate: { type: Date, required: true },
  points: { type: Number, required: true },
  submissionsCount: { type: Number, default: 0 },
  status: { type: String, default: 'active' },
  createdAt: { type: Date, default: Date.now }
});

export const AssignmentModel = mongoose.model<IAssignment>('Assignment', AssignmentSchema);
