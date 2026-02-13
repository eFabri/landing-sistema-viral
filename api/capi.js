export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const pixelId = process.env.META_PIXEL_ID;
  const accessToken = process.env.META_CAPI_TOKEN;

  const { event_name, event_id, event_source_url } = req.body || {};

  const payload = {
    data: [
      {
        event_name: event_name || 'InitiateCheckout',
        event_time: Math.floor(Date.now() / 1000),
        event_id: event_id,
        action_source: 'website',
        event_source_url: event_source_url || process.env.BASE_URL,
        user_data: {
          client_user_agent: req.headers['user-agent'],
          client_ip_address:
            (req.headers['x-forwarded-for'] || '').split(',')[0] ||
            req.socket.remoteAddress
        }
      }
    ]
  };

  const url = `https://graph.facebook.com/v18.0/${pixelId}/events?access_token=${accessToken}`;

  try {
    const fbRes = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await fbRes.json();
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ success: false, error: String(error) });
  }
}
