import { NextResponse } from 'next/server';
import User from '../../../../models/user.model';
import connectDB from '@/lib/mongodbConnection';

// Handle POST requests for creating a user
export async function POST(req: Request) {
  try {
    console.log('Connecting to database...');
    await connectDB();
    console.log('Database connected.');

    const { userName } = await req.json();
    console.log('Received userName:', userName);

    if (!userName) {
      console.log('Missing userName.');
      return NextResponse.json({ error: 'User name is required' }, { status: 400 });
    }

    const userExists = await User.findOne({ username: userName });
    if (userExists) {
      console.log('User already exists.');
      return NextResponse.json({ error: 'User already exists' }, { status: 409 });
    }

    const newUser = new User({ username: userName });
    await newUser.save();
    console.log('User created successfully.');

    return NextResponse.json({ message: 'User created successfully', user: newUser }, { status: 201 });
  } catch (error) {
    if (error instanceof Error) {
      console.error('POST /api/user error:', error.message);
      return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
    } else {
      console.error('POST /api/user unexpected error:', error);
      return NextResponse.json({ error: 'Unexpected Error' }, { status: 500 });
    }
  }
}

// Handle GET requests for checking if a user exists
export async function GET(req: Request) {
  try {
    console.log('Connecting to database...');
    await connectDB();
    console.log('Database connected.');

    const url = new URL(req.url);
    const username = url.searchParams.get('username');

    console.log('Received username:', username);

    if (!username) {
      console.log('Missing username.');
      return NextResponse.json({ error: 'Username is required' }, { status: 400 });
    }

    const userExists = await User.findOne({ username });

    if (userExists) {
      console.log('User exists.');
      return NextResponse.json({ message: 'User exists', user: userExists }, { status: 200 });
    } else {
      console.log('User does not exist.');
      return NextResponse.json({ message: 'User does not exist' }, { status: 404 });
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
    console.error('GET /api/user error:', errorMessage);
    return NextResponse.json({ error: 'Internal Server Error', details: errorMessage }, { status: 500 });
  }
}

// Handle PUT requests for updating a user
export async function PUT(req: Request) {
  try {
    console.log('Connecting to database...');
    await connectDB();
    console.log('Database connected.');

    const { oldUserName, newUserName } = await req.json();
    console.log('Received oldUserName:', oldUserName, 'newUserName:', newUserName);

    if (!oldUserName || !newUserName) {
      console.log('Missing oldUserName or newUserName.');
      return NextResponse.json({ error: 'Both old and new user names are required' }, { status: 400 });
    }

    const user = await User.findOne({ username: oldUserName });
    if (!user) {
      console.log('User not found.');
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    user.username = newUserName;
    await user.save();
    console.log('User updated successfully.');

    return NextResponse.json({ message: 'User updated successfully', user }, { status: 200 });
  } catch (error) {
    const errorMessage = (error instanceof Error) ? error.message : 'Internal Server Error';
    console.error('PUT /api/user error:', errorMessage);
    return NextResponse.json({ error: 'Internal Server Error', details: errorMessage }, { status: 500 });
  }
}
