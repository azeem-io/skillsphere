import { fail, redirect, type Actions } from '@sveltejs/kit';

const ISO_TO_NAME = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']; // 1..7

export const load = async ({ locals, params }) => {
  const { data: mentor } = await locals.supabase
    .from('profiles')
    .select('id, name, bio, skills, tags, rating_avg, rating_count, portfolio_url')
    .eq('id', params.id).eq('role', 'mentor').single();
  if (!mentor) return { mentor: null, nextOptions: [] };

  const { data: weekly } = await locals.supabase
    .from('weekly_availability')
    .select('weekday, start_time, end_time')
    .eq('mentor_id', params.id);

  const { data: booked } = await locals.supabase.rpc('mentor_booked_dates', {
    p_mentor: params.id,
    p_days: 7
  });
  const bookedSet = new Set<string>((booked ?? []).map((r: { d: string }) => r.d)); // 'YYYY-MM-DD'

  const wdSet = new Set<number>((weekly ?? []).map((w: any) => w.weekday));
  const timeByWD = new Map<number, { start: string; end: string }>();
  (weekly ?? []).forEach((w: any) => timeByWD.set(w.weekday, { start: w.start_time, end: w.end_time }));

  const options: Array<{ dateISO: string; weekday: string; time: string; booked: boolean, label: string }> = [];
  const today = new Date();

for (let i = 0; i < 7; i++) {
  const cur = new Date(today.getFullYear(), today.getMonth(), today.getDate() + i);
  const iso = ((cur.getDay() + 6) % 7) + 1; // JS 0..6 -> ISO 1..7
  if (!wdSet.has(iso)) continue;

  const y = cur.getFullYear();
  const m = String(cur.getMonth() + 1).padStart(2, '0');
  const d = String(cur.getDate()).padStart(2, '0');
  const dateISO = `${y}-${m}-${d}`;

  const label = cur.toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  const t = timeByWD.get(iso)!;
  const time = `${t.start.slice(0, 5)}–${t.end.slice(0, 5)}`; 
  const isBooked = bookedSet.has(dateISO);

  options.push({
    dateISO,
    label,
    weekday: ISO_TO_NAME[iso - 1],
    time,
    booked: isBooked
  });
}

  return { mentor, nextOptions: options };
};

export const actions: Actions = {
  book_day: async ({ request, locals, params }) => {
    const me = await locals.getUser();
    if (!me) throw redirect(303, '/auth/login?next=' + encodeURIComponent(`/mentors/${params.id}`));

    const form = await request.formData();
    const dateISO = String(form.get('date')); // YYYY-MM-DD

    const { data: session_id, error } = await locals.supabase.rpc('create_session_for_day', {
      p_mentor: params.id,
      p_learner: me.id,
      p_date: dateISO
    });
    if (error) return fail(400, { message: error.message });

    throw redirect(303, `/sessions/${session_id}`);
  }
};
