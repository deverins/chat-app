import { NextResponse } from 'next/server';
import Models from "@models/user.model"

export async function POST(req: Request) {
  try {
    const {User} = Models;

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
      console.error('POST /api/user error:', error);
      return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
    }
  }
}

export async function GET(req: Request) {
  try {
    const {User} = Models;

    const url = new URL(req.url);
    const username = url.searchParams.get('username');

    console.log('Received username:', username);

    if (!username) {
      console.log('Missing username.');
      return NextResponse.json({ error: 'Username is required' }, { status: 400 });
    }

    const userExists = await User.find({ username });

    if (userExists) {
      console.log('User exists.');
      return NextResponse.json({ message: 'User exists', user: userExists }, { status: 200 });
    } else {
      console.log('User does not exist.');
      return NextResponse.json({ message: 'User does not exist' }, { status: 404 });
    }
  } catch (error) {
    console.error('GET /api/user error:', error);
    return NextResponse.json({ error: 'Failed to fetch user information', details: error }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const { User } = Models;
    const { oldUserName, newUserName } = await req.json();
    console.log('Received oldUserName:', oldUserName, 'newUserName:', newUserName);

    if (!oldUserName || !newUserName) {
      console.log('Missing oldUserName or newUserName.');
      return NextResponse.json({ error: 'Both old and new user names are required' }, { status: 400 });
    }

    const users = await User.find({ username: oldUserName });
    if (users.length === 0) {
      console.log('User not found.');
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const updatedUsers = await Promise.all(
      users.map(async (user) => {
        user.username = newUserName;
        await user.save();
        return user;
      })
    );

    console.log('Users updated successfully.');

    return NextResponse.json({ message: 'Users updated successfully', users: updatedUsers }, { status: 200 });
  } catch (error) {
    console.error('PUT /api/user error:', error);
    return NextResponse.json({
      error: 'An unexpected error occurred while updating your username. Please try again later.'
    }, { status: 500 });  }
}
