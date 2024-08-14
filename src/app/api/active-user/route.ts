
import { NextResponse } from "next/server";
import Models from "@models/user.model"


export async function GET() {
  try {
    const { User } = Models;

    const activeUsers = await User.find({ status: 'active' }).select('username').lean();
    if (!activeUsers || activeUsers.length === 0) return NextResponse.json({ error: 'No active users found.' }, { status: 404 });

    return NextResponse.json({ activeUsers }, { status: 200 });
  } catch (error) {
    const errorMessage = error;
    return NextResponse.json({ error: 'An unexpected error occurred while fetching active users. Please try again later.', details: errorMessage }, { status: 500 });
  }
}
