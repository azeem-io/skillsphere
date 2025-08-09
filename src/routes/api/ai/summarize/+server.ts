import { json } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';

export const POST = async ({ request, locals }) => {
  const { session_id, maxChars = 3000 } = await request.json();
  
  const { data: s } = await locals.supabase.from('sessions')
      .select('id, mentor_id, learner_id').eq('id', session_id).single();
  const me = await locals.getUser();
  if (!me || (me.id !== s?.mentor_id && me.id !== s?.learner_id)) return new Response('Forbidden', { status: 403 });

  const { data: msgs } = await locals.supabase.from('session_messages')
    .select('sender_id, content, created_at').eq('session_id', session_id)
    .order('created_at');

  const text = (msgs ?? []).map(m => `[${m.created_at}] ${m.sender_id===s.learner_id?'Learner':'Mentor'}: ${m.content}`).join('\n');
  const clipped = text.slice(-maxChars);

  const prompt = `Summarize this mentoring session as:
1) Key takeaways (≤6 bullets)
2) Action items for learner (≤5 bullets)
3) 3 suggested next topics
Chat log:
${clipped}`;

  // OpenAI example (choose your model/endpoint)
  const r = await fetch('https://api.openai.com/v1/chat/completions', {
    method:'POST',
    headers:{ 'Content-Type':'application/json', 'Authorization':`Bearer ${env.OPENAI_API_KEY}` },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [{ role:'system', content:'Be concise.' }, { role:'user', content: prompt }],
      temperature: 0.2,
      max_tokens: 500
    })
  });
  const j = await r.json();
  const out = j.choices?.[0]?.message?.content ?? 'No summary.';

  // Store
  await locals.supabase.from('ai_notes').upsert({
    session_id, summary: out, suggestions: null, model: 'gpt-4o-mini'
  });

  return json({ summary: out });
};
