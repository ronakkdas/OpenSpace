import { createSupabaseServerClient } from './supabaseClient';

export type Profile = {
  id: string;
  role: 'student' | 'business';
  is_pro: boolean;
};

export async function getCurrentProfile(): Promise<Profile | null> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data, error } = await supabase
    .from('profiles')
    .select('id, role, is_pro')
    .eq('id', user.id)
    .maybeSingle();

  if (error || !data) return null;
  return {
    id: data.id,
    role: data.role,
    is_pro: data.is_pro
  };
}

