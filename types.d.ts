import { NextApiRequest } from "next";

export interface ActiveUser {
  id: string;
  name: string;
}
const activeUsers: ActiveUser[] = activeUsersStringArray.map((username, index) => ({
  id: `user-${index}`, // Assign a unique ID or use an existing one
  name: username,
}));
export interface CustomNextApiRequest extends NextApiRequest {
  userId?: string;  // Make it optional in case it's not always available
}

