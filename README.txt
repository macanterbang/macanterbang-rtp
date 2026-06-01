MACANTERBANG RTP AMP Dynamic — Opsi 2

ISI PAKET
- index.html
- functions/api/rtp.js
- data/providers.js

CARA PAKAI DI CLOUDFLARE PAGES
1. Upload semua isi folder ini ke repository GitHub.
2. Hubungkan repo ke Cloudflare Pages.
3. Deploy.
4. Endpoint JSON otomatis tersedia di:
   /api/rtp?provider=pragmatic
   /api/rtp?provider=jili
   /api/rtp?provider=pgsoft&q=mahjong

CARA UPDATE 1 JAM
- Tidak perlu cron.
- functions/api/rtp.js menghitung RTP berdasarkan Math.floor(Date.now() / 3600000).
- Jadi RTP berubah otomatis setiap pergantian jam.
- Header Cache-Control memakai s-maxage=3600.

CATATAN SEO/AMP
- Halaman tetap AMP karena tidak memakai custom JS di browser.
- Data dinamis diambil via amp-list.
- Provider aktif memakai amp-selector + amp-bind.
- Search memakai input AMP + endpoint q.
- Kalau domain final bukan https://macanterbang-rtp.com/, ganti canonical, og:url, dan title sesuai kebutuhan.
