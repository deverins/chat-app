export const isErrorMessage = (message: string): boolean => {
  const errorRegex = /Username is required|User already exists|Username is required|User does not exist|Both old and new usernames are required. try to refresh|User not found|The username as already been used|Failed to create user|Failed to fetch user information|An unexpected error occurred while updating your username. Please try again later./i;
  return errorRegex.test(message);
};
