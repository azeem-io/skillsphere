export const load = async ({ locals, url }) => {
  const q = url.searchParams.get('q')?.trim() ?? '';
  const dayParam = url.searchParams.get('day');
  const day = dayParam ? Number(dayParam) : null;

  let select = `
    id, name, bio, skills, tags, rating_avg, rating_count, timezone,
    weekly:weekly_availability(weekday)
  `;

  let query = locals.supabase
    .from('profiles')
    .select(select)
    .eq('role', 'mentor');

  if (q) {
    query = query.or(`name.ilike.%${q}%,bio.ilike.%${q}%,skills.ilike.%${q}%,tags.ilike.%${q}%`);
  }

  if (day) {
    query = locals.supabase
      .from('profiles')
      .select(`
        id, name, bio, skills, tags, rating_avg, rating_count, timezone,
        weekly:weekly_availability!inner(weekday)
      `)
      .eq('role', 'mentor')
      .eq('weekly_availability.weekday', day);

    if (q) query = query.or(`name.ilike.%${q}%,bio.ilike.%${q}%,skills.ilike.%${q}%,tags.ilike.%${q}%`);
  }
  // Default ordering by rating average then rating count (previous default when sort was 'rating')
  query = query
    .order('rating_avg', { ascending: false, nullsFirst: false })
    .order('rating_count', { ascending: false, nullsFirst: true });

  const { data: mentors } = await query.limit(60);
  return { mentors: mentors ?? [], q, day };
};
