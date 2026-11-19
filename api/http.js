// Minimal fetch wrapper replacing axios: throws on non-2xx, returns parsed JSON (or text).

function basicAuth(auth) {
    return 'Basic ' + Buffer.from(auth.username + ':' + auth.password).toString('base64');
}

async function request(method, url, { auth, headers = {}, body } = {}) {
    const opts = { method, headers: { ...headers } };
    if (auth)
        opts.headers['Authorization'] = basicAuth(auth);
    if (body !== undefined) {
        opts.headers['Content-Type'] ??= 'application/json';
        opts.body = typeof body === 'string' ? body : JSON.stringify(body);
    }

    const res = await fetch(url, opts);
    const text = await res.text();
    let data = text;
    if ((res.headers.get('content-type') ?? '').includes('json') && text) {
        try { data = JSON.parse(text); } catch { /* leave as text */ }
    }
    if (!res.ok)
        throw new Error(`Request failed with status code ${res.status} (${method} ${url})`);
    return { status: res.status, data };
}

export const get = (url, opts) => request('GET', url, opts);
export const post = (url, body, opts) => request('POST', url, { ...opts, body });

export default { get, post };
