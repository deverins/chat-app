import mongoose, { Schema, Document } from 'mongoose';

interface IUser extends Document {
  username: string;
  status: 'active' | 'inactive';
}

interface IMessage extends Document {
  sender: Schema.Types.ObjectId;
  receiver?: Schema.Types.ObjectId;
  type: "public" | "private";
  status: "seen" | 'unseen';
  message: string;
  timestamp: Date;
}

const userSchema: Schema = new Schema({
  username: { type: String, required: true, unique: true },
  status: { type: String, enum: ['active', 'inactive'], default: 'inactive' },
});

const User = mongoose.models.User ||  mongoose.model<IUser>('User', userSchema);

const messageSchema: Schema = new Schema({
  sender: { type: Schema.Types.ObjectId, ref: "User", required: true },
  receiver: { type: Schema.Types.ObjectId, ref: "User" },
  type: { type: String, enum: ['public', 'private'], required: true },
  status: { type: String, enum: ['seen', 'unseen'], default: 'unseen' },
  message: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

const Message = mongoose.models.Message ||  mongoose.model<IMessage>('Message', messageSchema);

export default { User, Message, mongoose };
