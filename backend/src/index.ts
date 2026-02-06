interface Env {
    DB: D1Database;
}

interface UserStats {
    device_id: string;
    total_verses_read: number;
    surahs_visited: number;
    favorites_count: number;
    reading_streak: number;
    today_verses_read: number;
    week_verses_read: number;
    progress_percent: number;
    last_read_surah: number | null;
    last_read_verse: number | null;
    last_sync: string;
}

// CORS headers for mobile app
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
};

export default {
    async fetch(request: Request, env: Env): Promise<Response> {
        // Handle CORS preflight
        if (request.method === 'OPTIONS') {
            return new Response(null, { headers: corsHeaders });
        }

        const url = new URL(request.url);
        const path = url.pathname;

        try {
            // POST /sync - Upsert user stats
            if (request.method === 'POST' && path === '/sync') {
                const stats: UserStats = await request.json();

                if (!stats.device_id) {
                    return new Response(JSON.stringify({ error: 'device_id required' }), {
                        status: 400,
                        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                    });
                }

                await env.DB.prepare(`
                    INSERT OR REPLACE INTO user_stats (
                        device_id, total_verses_read, surahs_visited, favorites_count,
                        reading_streak, today_verses_read, week_verses_read, progress_percent,
                        last_read_surah, last_read_verse, last_sync
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `).bind(
                    stats.device_id,
                    stats.total_verses_read || 0,
                    stats.surahs_visited || 0,
                    stats.favorites_count || 0,
                    stats.reading_streak || 0,
                    stats.today_verses_read || 0,
                    stats.week_verses_read || 0,
                    stats.progress_percent || 0,
                    stats.last_read_surah,
                    stats.last_read_verse,
                    new Date().toISOString()
                ).run();

                return new Response(JSON.stringify({ success: true }), {
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                });
            }

            // GET /stats/:deviceId - Get user stats
            if (request.method === 'GET' && path.startsWith('/stats/')) {
                const deviceId = path.replace('/stats/', '');

                const result = await env.DB.prepare(
                    'SELECT * FROM user_stats WHERE device_id = ?'
                ).bind(deviceId).first<UserStats>();

                if (!result) {
                    return new Response(JSON.stringify({ found: false }), {
                        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                    });
                }

                return new Response(JSON.stringify({ found: true, stats: result }), {
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                });
            }

            // Health check
            if (path === '/health') {
                return new Response(JSON.stringify({ status: 'ok' }), {
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                });
            }

            return new Response('Not Found', { status: 404, headers: corsHeaders });

        } catch (error) {
            console.error('Error:', error);
            return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
                status: 500,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }
    }
};
