import { NextResponse } from "next/server";
import Models from "@/lib/models/user.model";
import connectDB from "@/lib/mongodbConnection";

export async function GET() {
  try {
    await connectDB();
    const { User } = Models;

    const activeUsers = await User.find({ status: "active" })
      .select("username")
      .lean();
    if (!activeUsers || activeUsers.length === 0) {
      return NextResponse.json({ activeUsers: [] }, { status: 200 });
    }

    return NextResponse.json({ activeUsers }, { status: 200 });
  } catch (error) {
    const errorMessage = error;
    return NextResponse.json(
      {
        error:
          "An unexpected error occurred while fetching active users. Please try again later.",
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}
