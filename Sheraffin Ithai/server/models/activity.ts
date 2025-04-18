import mongoose, { Schema, Document } from 'mongoose';

export interface IActivity extends Document {
  id: number;
  userId: number;
  type: string;
  action: string;
  target: string;
  createdAt: Date;
}

const ActivitySchema: Schema = new Schema({
  id: { type: Number, required: true, unique: true },
  userId: { type: Number, required: true },
  type: { type: String, required: true },
  action: { type: String, required: true },
  target: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

export const ActivityModel = mongoose.model<IActivity>('Activity', ActivitySchema);
