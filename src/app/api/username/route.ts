import { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '@/lib/mongodbConnection';
import User from '../../../../models/user.model';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('API handler start');

  if (req.method !== 'POST') {
    console.log('Invalid method:', req.method);
    return res.setHeader('Allow', ['POST']).status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    await connectDB(); // Ensure DB connection
    console.log('DB connected');

    const { username } = req.body;
    console.log('Received username:', username);

    if (!username) {
      console.log('Username is missing');
      return res.status(400).json({ error: 'Username is required' });
    }

    const user = await User.findOne({ username: username.toLowerCase() });
    console.log('User query completed');

    if (user) {
      console.log('User exists');
      return res.status(200).json({ exists: true });
    }

    console.log('User does not exist');
    return res.status(200).json({ exists: false });

  } catch (error) {
    console.error('Error in API handler:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
