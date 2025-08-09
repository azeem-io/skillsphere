export const load = async ({ locals, url }) => {
  const q = url.searchParams.get('q')?.trim() ?? '';
  const dayParam = url.searchParams.get('day');         
  const day = dayParam ? Number(dayParam) : null;
  const sort = url.searchParams.get('sort') ?? 'rating';  

  let select = `
    id, name, bio, skills, tags, rating_avg, rating_count, timezone,
    weekly:weekly_availability(weekday)
  `;

  let query = locals.supabase
    .from('profiles')
    .select(select)
    .eq('role', 'mentor');

  if (q) {
    query = query.or(`name.ilike.%${q}%,bio.ilike.%${q}%`);
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

    if (q) query = query.or(`name.ilike.%${q}%,bio.ilike.%${q}%`);
  }

  if (sort === 'reviews') {
    query = query.order('rating_count', { ascending: false, nullsFirst: false });
  } else if (sort === 'name') {
    query = query.order('name', { ascending: true });
  } else {
    query = query
      .order('rating_avg', { ascending: false, nullsFirst: false })
      .order('rating_count', { ascending: false, nullsFirst: true });
  }

  const { data: mentors } = await query.limit(60);
  return { mentors: mentors ?? [], q, day, sort };
};
