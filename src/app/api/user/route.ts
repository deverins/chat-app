import { NextResponse, NextRequest } from "next/server";
import Models from "@models/user.model";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const userName = formData.get("username");

    if (!userName) {
      return NextResponse.json(
        { error: "User name is required" },
        { status: 400 }
      );
    }

    const { User } = Models;
    const userExists = await User.findOne({ username: userName });
    if (userExists) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 409 }
      );
    }
    const newUser = await User.create({ username: userName });

    return NextResponse.json(
      { message: "User created successfully", user: newUser },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/user error:", error);
    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const username = url.searchParams.get("username");

    if (!username) {
      return NextResponse.json(
        { error: "Username is required" },
        { status: 400 }
      );
    }
    const { User } = Models;

    const userExists = await User.findOne({ username });

    if (userExists) {
      return NextResponse.json(
        { message: "User exists", user: userExists },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { message: "User does not exist" },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error("GET /api/user error:", error);
    return NextResponse.json(
      { error: "Failed to fetch user information", details: error },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const formData = await req.formData();
    const oldUserName = formData.get("oldUserName");
    const newUserName = formData.get("newUserName");

    if (!oldUserName || !newUserName) {
      return NextResponse.json(
        { error: "Both old and new usernames are required. try to refresh" },
        { status: 400 }
      );
    }

    const { User } = Models;
    const users = await User.find({ username: oldUserName });
    if (users.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    const userExists = await User.findOne({ username: newUserName });
    if (userExists) {
      return NextResponse.json(
        { error: "The username as already been used" },
        { status: 409 }
      );
    }
    const updatedUsers = await Promise.all(
      users.map(async (user) => {
        user.username = newUserName;
        await user.save();
        return user;
      })
    );

    return NextResponse.json(
      { message: "Users updated successfully", users: updatedUsers },
      { status: 200 }
    );
  } catch (error) {
    console.error("PUT /api/user error:", error);
    return NextResponse.json(
      {
        error:
          "An unexpected error occurred while updating your username. Please try again later.",
      },
      { status: 500 }
    );
  }
}
