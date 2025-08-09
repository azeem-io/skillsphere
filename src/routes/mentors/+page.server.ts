export const load = async ({ locals, url }) => {
  const q = url.searchParams.get('q')?.trim() ?? '';
  let query = locals.supabase.from('profiles')
    .select('id, name, bio, skills, tags, rating_avg, rating_count')
    .eq('role','mentor')
    .order('rating_avg', { ascending: false, nullsFirst: false });

  if (q) query = query.or(`name.ilike.%${q}%,bio.ilike.%${q}%,skills.cs.{${q}}`);

  const { data: mentors } = await query.limit(50);
  return { mentors, q };
};
