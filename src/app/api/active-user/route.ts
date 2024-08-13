import connectDB from "@/lib/mongodbConnection";
import User from "../../../../models/user.model";
import { NextResponse } from "next/server";


export async function GET() {
  try {
    await connectDB();

    const activeUsers = await User.find({ active: true }).select('username').lean();

    return NextResponse.json({ activeUsers }, { status: 200 });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: 'Internal Server Error', details: errorMessage }, { status: 500 });
  }
}
