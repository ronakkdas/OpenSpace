'use server';

import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabaseClient';

async function getOrCreateRole(userId: string): Promise<'student' | 'business'> {
  const supabase = await createSupabaseServerClient();

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .maybeSingle();

  if (profile?.role === 'student' || profile?.role === 'business') {
    return profile.role;
  }

  // Fallback for older accounts created before `profiles` insert existed
  await supabase.from('profiles').insert({ id: userId, role: 'student' });
  return 'student';
}

export async function signIn(formData: FormData) {
  const email = String(formData.get('email') ?? '');
  const password = String(formData.get('password') ?? '');

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    return { error: error.message };
  }

  const userId = data.user.id;
  const role = await getOrCreateRole(userId);

  if (role === 'business') {
    redirect('/dashboard');
  } else {
    redirect('/pricing');
  }
}

export async function signUp(formData: FormData) {
  const email = String(formData.get('email') ?? '');
  const password = String(formData.get('password') ?? '');
  const role = String(formData.get('role') ?? 'student') as 'student' | 'business';

  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password
  });

  if (error || !data.user) {
    return { error: error?.message ?? 'Unable to sign up' };
  }

  await supabase.from('profiles').insert({
    id: data.user.id,
    role
  });

  if (role === 'student') {
    redirect('/pricing');
  } else {
    redirect('/onboarding/step-1');
  }
}

export async function signOut() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect('/');
}

