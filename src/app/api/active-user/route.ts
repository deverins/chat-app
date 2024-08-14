
import { NextResponse } from "next/server";
import Models from "@models/user.model"


export async function GET() {
  try {
    const {User} = Models;

    const activeUsers = await User.find({ status: 'active' }).select('username').lean();

    return NextResponse.json({ activeUsers }, { status: 200 });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: 'Internal Server Error', details: errorMessage }, { status: 500 });
  }
}
