'use server';

// This file is currently not in use but is kept for potential future server-side auth flows.
// All authentication logic has been moved to client components in /login and /signup.

export async function login(email: string, password: string) {
  // This is a placeholder. Client-side auth is used instead.
  return { error: 'This server action is not implemented. Use client-side login.' };
}

export async function signup(email: string, password: string, displayName: string) {
    // This is a placeholder. Client-side auth is used instead.
    return { error: 'This server action is not implemented. Use client-side signup.' };
}

export async function logout() {
    // This is a placeholder. Client-side auth is used instead.
    return { success: true };
}
