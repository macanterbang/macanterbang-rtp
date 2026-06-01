import { PROVIDERS } from "../../data/providers.js";

function hashSeed(a, b, c, d) {
  let h = 2166136261;
  for (const x of [a, b, c, d]) {
    h = Math.imul(h ^ Number(x), 16777619);
  }
  h = h ^ (h >>> 16);
  h = Math.imul(h, 2246822507);
  h = h ^ (h >>> 13);
  h = Math.imul(h, 3266489909);
  h = h ^ (h >>> 16);
  return Math.abs(h);
}

function calcRTP(providerIdx, gameIdx, hourSlot) {
  const daySeed = Math.floor(hourSlot / 24);
  const h = hashSeed(providerIdx + 1, gameIdx + 1, daySeed, hourSlot);
  const mod = h % 1000;
  let rtp;

  if (mod < 150) {
    rtp = 8 + (h % 22);
  } else if (mod < 700) {
    rtp = 30 + (hashSeed(gameIdx, providerIdx, hourSlot, daySeed) % 41);
  } else {
    rtp = 71 + (hashSeed(hourSlot, daySeed, providerIdx, gameIdx) % 27);
  }

  if (rtp > 98) rtp = 98;
  if (rtp < 5) rtp = 5;
  return rtp;
}

function colorClass(rtp) {
  if (rtp >= 71) return "rtp-green";
  if (rtp >= 30) return "rtp-yellow";
  return "rtp-red";
}

function corsHeaders(request) {
  const url = new URL(request.url);
  const sourceOrigin = url.searchParams.get("__amp_source_origin") || url.origin;

  return {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
    "AMP-Access-Control-Allow-Source-Origin": sourceOrigin,
    "Access-Control-Expose-Headers": "AMP-Access-Control-Allow-Source-Origin",
    "Cache-Control": "public, max-age=60, s-maxage=3600"
  };
}

export async function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);

  const providerId = (url.searchParams.get("provider") || "pragmatic").toLowerCase();
  const query = (url.searchParams.get("q") || "").toLowerCase().trim();

  const providerIdx = Math.max(0, PROVIDERS.findIndex((p) => p.id === providerId));
  const provider = PROVIDERS[providerIdx] || PROVIDERS[0];

  // Update RTP every 1 hour.
  const hourSlot = Math.floor(Date.now() / 3600000);

  let items = provider.games.map((game, gameIdx) => {
    const rtp = calcRTP(providerIdx, gameIdx, hourSlot);
    return {
      provider: provider.name,
      providerId: provider.id,
      name: game.name,
      image: game.image,
      rtp,
      colorClass: colorClass(rtp),
      widthClass: `w-${rtp}`
    };
  });

  if (query) {
    items = items.filter((item) => {
      const haystack = `${item.name} ${item.provider} ${item.providerId}`.toLowerCase();
      return haystack.includes(query);
    });
  }

  return new Response(JSON.stringify({
    provider: provider.name,
    providerId: provider.id,
    updatedAt: new Date(hourSlot * 3600000).toISOString(),
    refreshEvery: "1 hour",
    count: items.length,
    items
  }), {
    status: 200,
    headers: corsHeaders(request)
  });
}
