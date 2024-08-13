import { NextApiRequest, NextApiResponse } from 'next';
import mongoose, { Schema } from 'mongoose';
import connectDB from '@/lib/mongodbConnection';

const UserSchema = new Schema({
  username: { type: String, unique: true, required: true },
  status: { type: String, enum: ['active', 'inactive'], default: 'inactive' },
  messages: { type: Array, default: [] },
});

const User = mongoose.models.User || mongoose.model('User', UserSchema);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { username } = req.body;

    try {
      await connectDB();
      const user = await User.findOne({ username: username.toLowerCase() });
      if (user) {
        return res.status(200).json({ exists: true });
      } else {
        return res.status(200).json({ exists: false });
      }
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
