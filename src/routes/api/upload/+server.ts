import { json, type RequestHandler } from '@sveltejs/kit';
import { createClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL } from '$env/static/public';
import { env } from '$env/dynamic/private';

// Max file size 5MB (adjust if needed)
const MAX_BYTES = 5 * 1024 * 1024;

export const POST: RequestHandler = async ({ request }) => {
	try {
		console.log('[upload] incoming');
		let form: FormData;
		try {
			form = await request.formData();
		} catch (err) {
			console.error('[upload] formData parse failed', err);
			return json({ error: 'Invalid multipart data' }, { status: 400 });
		}
		const file = form.get('file');
		const sessionId = form.get('sessionId');

		if (!(file instanceof File)) {
			console.warn('[upload] no file');
			return json({ error: 'Missing file' }, { status: 400 });
		}
		if (typeof sessionId !== 'string' || !sessionId) {
			console.warn('[upload] missing sessionId');
			return json({ error: 'Missing sessionId' }, { status: 400 });
		}
		if (!file.type.startsWith('image/')) {
			console.warn('[upload] invalid type', file.type);
			return json({ error: 'Only image uploads allowed' }, { status: 400 });
		}
		if (file.size > MAX_BYTES) {
			console.warn('[upload] file too large', file.size);
			return json({ error: 'File too large' }, { status: 413 });
		}

		const SERVICE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;
		if (!SERVICE_KEY) {
			console.error('[upload] missing SUPABASE_SERVICE_ROLE_KEY env');
			return json({ error: 'Missing service role key on server' }, { status: 500 });
		}
		const supabase = createClient(PUBLIC_SUPABASE_URL, SERVICE_KEY, {
			auth: { persistSession: false }
		});

		const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
		const path = `sessions/${sessionId}/${Date.now()}-${safeName}`;
		console.log('[upload] uploading', { path, size: file.size, type: file.type });
		const { error: uploadError } = await supabase.storage
			.from('session-uploads')
			.upload(path, file, { upsert: false, contentType: file.type });

		if (uploadError) {
			console.error('[upload] storage error', uploadError);
			return json({ error: uploadError.message }, { status: 500 });
		}

		const { data: pub } = supabase.storage.from('session-uploads').getPublicUrl(path);
		console.log('[upload] success', pub.publicUrl);
		return json({ url: pub.publicUrl });
	} catch (e: any) {
		console.error('[upload] exception', e);
		return json({ error: e?.message || 'Upload failed' }, { status: 500 });
	}
};
