// model/user.model.ts
import mongoose, { Schema, Document } from 'mongoose';

interface IUser extends Document {
  username: string;
  status: 'active' | 'inactive';
  messages: { from: string; message: string; timestamp: Date }[];
}

const userSchema: Schema = new Schema({
  username: { type: String, required: true, unique: true },
  status: { type: String, enum: ['active', 'inactive'], default: 'inactive' },
  messages: [
    {
      from: String,
      message: String,
      timestamp: Date,
    },
  ],
});

const User = mongoose.models.User || mongoose.model<IUser>('User', userSchema);

export default User;
