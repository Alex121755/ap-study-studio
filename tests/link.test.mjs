import test from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {
  MAX_PAGE_BYTES, MAX_LINK_TEXT, LinkReaderError, validatePublicURL,
  isPublicIPAddress, decodeHTMLEntities, extractReadableText, readPublicLink, handleLinkRequest,
} from '../lib/link-reader.ts';

const prose = '这是用于测试的公开学习材料，解释证据、研究设计和结论之间的关系。'.repeat(15);
const html = `<html><head><title>Study &amp; evidence</title></head><body><nav>导航</nav><article><h1>学习材料</h1><p>${prose}</p><script>alert('secret')</script><style>.private{}</style></article></body></html>`;
const publicA = '93.184.216.34';
const page = (source = html, headers = {}) => new Response(source, { headers: { 'Content-Type': 'text/html; charset=utf-8', ...headers } });
function mockNetwork(options = {}) {
  const calls = [];
  const fetcher = async (input, init) => {
    const url = new URL(String(input));
    calls.push({ url, init });
    if (url.hostname === 'cloudflare-dns.com') {
      const type = url.searchParams.get('type');
      const host = url.searchParams.get('name');
      return Response.json({ Status: 0, Answer: options.dns ? options.dns(host, type) : type === 'A' ? [{ type: 1, data: publicA }] : [] });
    }
    return options.response ? options.response(url, calls) : page();
  };
  return { fetcher, calls };
}
const request = (body = { url: 'https://study.example.com/article#section' }, headers = {}) => new Request('https://atlas.example/api/materials/link', {
  method: 'POST', headers: { 'Content-Type': 'application/json', ...headers }, body: JSON.stringify(body),
});

test('URL policy normalizes fragments and rejects credentials, private names, IP forms and ports', () => {
  assert.equal(validatePublicURL(' https://Study.Example.com:443/a?q=1#part ').href, 'https://study.example.com/a?q=1');
  const withCredentials = new URL('https://example.com');
  withCredentials.username = 'fixture-user';
  withCredentials.password = randomUUID();
  for (const value of [null, '', '/relative', 'http://example.com', withCredentials.href, 'https://example.com:8443',
    'https://localhost', 'https://local', 'https://foo.local', 'https://foo.internal', 'https://foo.test',
    'https://metadata.google.internal', 'https://example.com.', 'https://127.0.0.1', 'https://127.1',
    'https://2130706433', 'https://0x7f000001', 'https://0177.0.0.1', 'https://[::1]', 'https://[2606:4700::1111]',
    'https://foo\\@example.com', 'https://exam\nple.com', 'https://foo.123']) {
    assert.throws(() => validatePublicURL(value), LinkReaderError, String(value));
  }
});

test('address policy excludes private, reserved, documentation and encapsulation ranges', () => {
  for (const ip of ['1.1.1.1', '8.8.8.8', publicA, '2606:4700:4700::1111', '2001:4860:4860::8888']) assert.equal(isPublicIPAddress(ip), true, ip);
  for (const ip of ['0.0.0.0', '10.0.0.1', '127.0.0.1', '100.64.0.1', '169.254.169.254', '172.16.0.1', '192.168.1.1',
    '192.0.0.9', '192.0.2.1', '198.18.0.1', '198.51.100.1', '203.0.113.1', '224.0.0.1', '255.255.255.255',
    '::', '::1', '::ffff:10.0.0.1', 'fc00::1', 'fe80::1', 'ff02::1', '64:ff9b::127.0.0.1',
    '2001:db8::1', '2001::1', '2002:7f00:1::1', '3ffe::1', '3fff::1', 'not-an-ip']) assert.equal(isPublicIPAddress(ip), false, ip);
});

test('extractor strips executable and navigation content and decodes plain-text entities', () => {
  const material = extractReadableText(html, 'text/html', 'https://study.example.com/a');
  assert.equal(material.title, 'Study & evidence');
  assert.ok(material.text.includes(prose));
  assert.doesNotMatch(material.text, /alert|secret|private|导航|<script>/);
  assert.equal(decodeHTMLEntities('A &amp; B &#65; &#x4E2D; &nbsp; &mdash;'), 'A & B A 中   —');
  assert.equal(extractReadableText('X'.repeat(20000), 'text/plain', 'https://example.com').text.length, MAX_LINK_TEXT);
});

test('successful read validates both DNS record types and forwards no caller secrets', async () => {
  const network = mockNetwork();
  const response = await handleLinkRequest(request(undefined, { Authorization: 'Bearer caller-secret', Cookie: 'session=private' }), {
    authenticate: async () => true, fetcher: network.fetcher,
  });
  assert.equal(response.status, 200);
  assert.equal((await response.json()).url, 'https://study.example.com/article');
  assert.equal(network.calls.length, 3);
  assert.equal(response.headers.get('cache-control'), 'no-store');
  for (const call of network.calls) {
    const headers = new Headers(call.init.headers);
    assert.equal(headers.has('authorization'), false);
    assert.equal(headers.has('cookie'), false);
    assert.equal(call.init.credentials, 'omit');
  }
});

test('auth and input failures happen before any network request', async () => {
  const network = mockNetwork();
  const unauth = await handleLinkRequest(request(), { authenticate: async () => false, fetcher: network.fetcher });
  assert.equal(unauth.status, 401);
  const badType = await handleLinkRequest(request(undefined, { 'Content-Type': 'text/plain' }), { authenticate: async () => true, fetcher: network.fetcher });
  assert.equal(badType.status, 415);
  const badURL = await handleLinkRequest(request({ url: 'https://127.0.0.1' }), { authenticate: async () => true, fetcher: network.fetcher });
  assert.equal(badURL.status, 400);
  assert.equal(network.calls.length, 0);
});

test('rejects any private DNS answer, including mixed public/private and local CNAME aliases', async () => {
  for (const records of [[{ type: 1, data: '10.0.0.1' }], [{ type: 1, data: publicA }, { type: 28, data: '::1' }],
    [{ type: 5, data: 'foo.internal.' }, { type: 1, data: publicA }]]) {
    const network = mockNetwork({ dns: () => records });
    await assert.rejects(readPublicLink('https://study.example.com', { fetcher: network.fetcher }), LinkReaderError);
    assert.ok(network.calls.every(call => call.url.hostname === 'cloudflare-dns.com'));
  }
});

test('redirects revalidate URL and DNS before fetching the next public page', async () => {
  const network = mockNetwork({ response: url => url.hostname === 'study.example.com' ? new Response(null, { status: 302, headers: { Location: 'https://other.example.com/final#anchor' } }) : page() });
  const material = await readPublicLink('https://study.example.com', { fetcher: network.fetcher });
  assert.equal(material.url, 'https://other.example.com/final');
  assert.equal(network.calls.length, 6);
  assert.ok(network.calls.filter(call => call.url.hostname !== 'cloudflare-dns.com').every(call => call.init.redirect === 'manual'));
  const unsafe = mockNetwork({ response: () => new Response(null, { status: 302, headers: { Location: 'https://169.254.169.254/' } }) });
  await assert.rejects(readPublicLink('https://study.example.com', { fetcher: unsafe.fetcher }), LinkReaderError);
  assert.equal(unsafe.calls.length, 3);
  const dnsUnsafe = mockNetwork({
    dns: (host, type) => type === 'A' ? [{ type: 1, data: host === 'other.example.com' ? '192.168.1.1' : publicA }] : [],
    response: () => new Response(null, { status: 302, headers: { Location: 'https://other.example.com/' } }),
  });
  await assert.rejects(readPublicLink('https://study.example.com', { fetcher: dnsUnsafe.fetcher }), LinkReaderError);
  assert.equal(dnsUnsafe.calls.filter(call => call.url.hostname === 'other.example.com').length, 0);
});

test('limits redirects and rejects unsupported or login/dynamic responses', async () => {
  const loop = mockNetwork({ response: () => new Response(null, { status: 302, headers: { Location: '/again' } }) });
  await assert.rejects(readPublicLink('https://study.example.com', { fetcher: loop.fetcher }), /跳转次数过多/);
  assert.equal(loop.calls.filter(call => call.url.hostname !== 'cloudflare-dns.com').length, 4);
  for (const response of [() => new Response('%PDF', { headers: { 'Content-Type': 'application/pdf' } }),
    () => new Response('forbidden', { status: 403 }), () => page('<html><body>Please enable JavaScript</body></html>')]) {
    const network = mockNetwork({ response });
    await assert.rejects(readPublicLink('https://study.example.com', { fetcher: network.fetcher }), LinkReaderError);
  }
});

test('enforces byte limits from both Content-Length and streamed decoded bytes', async () => {
  for (const response of [() => page('small', { 'Content-Length': String(MAX_PAGE_BYTES + 1) }),
    () => new Response(new ReadableStream({ start(controller) { controller.enqueue(new Uint8Array(MAX_PAGE_BYTES)); controller.enqueue(new Uint8Array(1)); controller.close(); } }), { headers: { 'Content-Type': 'text/plain' } })]) {
    const network = mockNetwork({ response });
    await assert.rejects(readPublicLink('https://study.example.com', { fetcher: network.fetcher }), error => error instanceof LinkReaderError && error.status === 413);
  }
});

test('shared deadline covers stalled fetch and errors do not expose internals', async () => {
  await assert.rejects(readPublicLink('https://study.example.com', { fetcher: () => new Promise(() => {}), timeoutMs: 5 }), error => error.status === 504);
  const network = mockNetwork({ response: () => { throw new Error('private-origin-details'); } });
  const response = await handleLinkRequest(request(), { authenticate: async () => true, fetcher: network.fetcher });
  assert.equal(response.status, 502);
  assert.doesNotMatch(await response.text(), /private-origin-details/);
});
