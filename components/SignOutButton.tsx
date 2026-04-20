'use client';

import { signOut } from '@/app/auth-actions';

export function SignOutButton() {
  return (
    <form action={signOut}>
      <button
        type="submit"
        className="text-xs text-espresso/70 hover:text-espresso transition"
      >
        Sign out
      </button>
    </form>
  );
}
