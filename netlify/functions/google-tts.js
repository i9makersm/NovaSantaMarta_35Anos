exports.handler = async function(event) {
  const text = (event.queryStringParameters && event.queryStringParameters.q || '').trim();

  if (!text) {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
      body: 'Missing q parameter'
    };
  }

  if (text.length > 220) {
    return {
      statusCode: 413,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
      body: 'Text is too long'
    };
  }

  const url = 'https://translate.google.com/translate_tts?ie=UTF-8&tl=pt-BR&client=tw-ob&q=' + encodeURIComponent(text);
  const response = await fetch(url, {
    headers: {
      'Accept': 'audio/mpeg,audio/*;q=0.9,*/*;q=0.8',
      'Referer': 'https://translate.google.com/',
      'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0 Safari/537.36'
    }
  });

  if (!response.ok) {
    return {
      statusCode: response.status,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
      body: 'Google TTS request failed'
    };
  }

  const audio = Buffer.from(await response.arrayBuffer());

  return {
    statusCode: 200,
    isBase64Encoded: true,
    headers: {
      'Content-Type': 'audio/mpeg',
      'Cache-Control': 'public, max-age=31536000, immutable'
    },
    body: audio.toString('base64')
  };
};
