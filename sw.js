/* يحفظ غلاف التطبيق فقط ليفتح فورًا — بيانات النظام تأتي دائمًا من النظام مباشرة. */
const V = 'siwar-shell-v6';
const SHELL = ['./', 'index.html', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png', 'apple-touch-icon.png', 'favicon.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(V).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (u.origin !== location.origin) return;
  // الشبكة أولًا بمهلة 4 ثوانٍ — شبكة متعثرة لا تُبقي الغلاف معلقًا؛ بعدها النسخة المحفوظة
  const net = fetch(e.request).then(r => { const c = r.clone(); caches.open(V).then(x => x.put(e.request, c)); return r; });
  const slow = new Promise((_, rej) => setTimeout(() => rej(new Error('slow')), 4000));
  const cached = () => caches.match(e.request).then(r => r || caches.match('index.html'));
  e.respondWith(Promise.race([net, slow]).catch(() => cached().then(r => r || net)));
});
