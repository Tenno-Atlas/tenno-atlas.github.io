import { writeFile, mkdir, readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(__dirname, '..', 'data');
const OUT_FILE = join(OUT_DIR, 'primes.json');

const CAT_FILE = join(OUT_DIR, 'categories.json');
const ATLAS_FILE = join(OUT_DIR, 'atlas.json');

const IMG_FILE = join(OUT_DIR, 'images.json');
const CACHE_DIR =join(__dirname, '..', '.cache');
const HTML_CACHE = join(CACHE_DIR, 'droptable.html');
const ITEMS_CACHE = join(CACHE_DIR, 'items.json');

const DROPTABLE_URL = 'https://www.warframe.com/droptables';
const ITEMS_URL = 'https://api.warframestat.us/items/?language=en&only=name,isPrime,category,productCategory,imageName';

const STATES = ['Intact', 'Exceptional', 'Flawless', 'Radiant'];
const CDN = 'https://cdn.warframestat.us/img/';

const EXCLUDE_LOCATION = /faceoff|conclave|lunaro|plague star|ghoul|hemocyte/i;

async function fetchWithRetry(url, { json, cacheFile, maxRetries = 3 } = {}) {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const res = await fetch(url, { headers: { 'User-Agent': 'WFRELICS-builder' }, redirect: 'follow' });
      if (!res.ok) {
        if (res.status >= 500 && attempt < maxRetries - 1) {
          const delay = 2 ** attempt * 1000;
          console.log(`⚠ HTTP ${res.status}, повтор через ${delay}ms...`);
          await new Promise((r) => setTimeout(r, delay));
          continue;
        }
        throw new Error(`${url} -> HTTP ${res.status}`);
      }
      const text = await res.text();
      if (cacheFile) {
        await mkdir(CACHE_DIR, { recursive: true });
        await writeFile(cacheFile, text);
      }
      return json ? JSON.parse(text) : text;
    } catch (err) {
      if (attempt === maxRetries - 1) {
        if (cacheFile) {
          try {
            console.log(`⚠ Все попытки не удались. Беру кэш ${cacheFile}...`);
            const text = await readFile(cacheFile, 'utf8');
            return json ? JSON.parse(text) : text;
          } catch {  }
        }
        throw err;
      }
      const delay = 2 ** attempt * 1000;
      console.log(`⚠ Ошибка: ${err.message}, повтор через ${delay}ms...`);
      await new Promise((r) => setTimeout(r, delay));
    }
  }
}

function ownerOf(name) {
  const i = name.indexOf(' Prime');
  if (i < 0) return null;
  return name.slice(0, i + ' Prime'.length);
}
function shortPart(name, owner) {
  const rest = name.slice(owner.length).trim();
  return rest === '' ? 'Set' : rest;
}
const FRAME_PART = /^(Neuroptics|Chassis|Systems) Blueprint$/;

function categoryFromWarframestat(i) {
  if (i.productCategory === 'SentinelWeapons') return 'SentinelWeapon';
  if (i.category === 'Warframes') return 'Warframe';
  if (i.category === 'Sentinels') return 'Sentinel';
  return i.category;
}

function parseHeader(h) {
  let planet = null, place = h.trim();
  const slash = place.indexOf('/');
  if (slash >= 0) { planet = place.slice(0, slash).trim(); place = place.slice(slash + 1).trim(); }
  let type = null, node = place;
  const tm = place.match(/^(.*?)\s*\(([^)]+)\)\s*$/);
  if (tm) { node = tm[1].trim(); type = tm[2].trim(); }
  return { planet, node, type };
}

function sectionBetween(html, startId, endId) {
  const s = html.indexOf(`id="${startId}"`);
  if (s < 0) return '';
  const e = endId ? html.indexOf(`id="${endId}"`, s + 1) : html.length;
  return html.slice(s, e < 0 ? html.length : e);
}

function parseRelicContents(html) {
  const sec = sectionBetween(html, 'relicRewards', 'keyRewards');
  const map = new Map();
  const blockRe = /<th colspan="2">([A-Za-z]+) ([A-Za-z]?\d+) Relic \((Intact|Exceptional|Flawless|Radiant)\)<\/th>(.*?)(?=<tr class="blank-row"|<th colspan)/gs;
  let m;
  while ((m = blockRe.exec(sec)) !== null) {
    const [, tier, code, state, body] = m;
    const id = `${tier} ${code}`;
    let relic = map.get(id);
    if (!relic) { relic = { tier, code, rewards: new Map() }; map.set(id, relic); }
    const rowRe = /<td>([^<]+)<\/td><td>([A-Za-z]+) \(([\d.]+)%\)<\/td>/g;
    let r;
    while ((r = rowRe.exec(body)) !== null) {
      const item = r[1].trim();
      const rarity = r[2];
      const chance = parseFloat(r[3]);
      let rw = relic.rewards.get(item);
      if (!rw) { rw = { item, rarity, chances: {} }; relic.rewards.set(item, rw); }
      rw.chances[state] = chance;
    }
  }
  return map;
}

function parseRelicDrops(html) {

  const slices = [
    sectionBetween(html, 'missionRewards', 'relicRewards'),
    sectionBetween(html, 'keyRewards', 'modByAvatar'),
  ].join('');
  const drops = new Map();
  const rowRe = /<tr[^>]*>(.*?)<\/tr>/gs;
  let loc = null, rot = null, m;
  while ((m = rowRe.exec(slices)) !== null) {
    const row = m[1];
    const th = row.match(/<th[^>]*>(.*?)<\/th>/);
    if (th) {
      const t = th[1].trim();

      const isStage = /pad-cell/.test(row);
      if (/^Rotation\b/i.test(t)) rot = t.replace(/^Rotation\s+/i, '');
      else if (isStage) {  }
      else { loc = t; rot = null; }
      continue;
    }
    if (!loc) continue;

    const cells = [...row.matchAll(/<td[^>]*>([^<]*)<\/td>/g)].map((c) => c[1].trim()).filter(Boolean);
    if (cells.length < 2) continue;
    const rm = cells[0].match(/^([A-Za-z]+) ([A-Za-z]?\d+) Relic$/);
    if (!rm) continue;
    if (EXCLUDE_LOCATION.test(loc)) continue;
    const id = `${rm[1]} ${rm[2]}`;
    const chanceM = cells[1].match(/([\d.]+)%/);
    const chance = chanceM ? parseFloat(chanceM[1]) : 0;
    const { planet, node, type } = parseHeader(loc);
    const locKey = `${loc}|${rot ?? ''}`;
    let byLoc = drops.get(id);
    if (!byLoc) { byLoc = new Map(); drops.set(id, byLoc); }
    const prev = byLoc.get(locKey);
    if (!prev || chance > prev.chance) byLoc.set(locKey, { planet, node, type, rotation: rot, chance });
  }
  return drops;
}

const PLANET_RESOURCES = {
  Mercury: ['Ferrite', 'Polymer Bundle', 'Morphics', 'Detonite Ampule'],
  Venus: ['Alloy Plate', 'Polymer Bundle', 'Circuits', 'Fieldron Sample'],
  Earth: ['Ferrite', 'Rubedo', 'Neurodes', 'Detonite Ampule'],
  Lua: ['Ferrite', 'Rubedo', 'Neurodes', 'Detonite Ampule'],
  Mars: ['Salvage', 'Morphics', 'Gallium', 'Fieldron Sample'],
  Phobos: ['Alloy Plate', 'Rubedo', 'Plastids', 'Morphics', 'Fieldron Sample'],
  Deimos: ['Nano Spores', 'Neurodes', 'Orokin Cell', 'Mutagen Sample'],
  Ceres: ['Alloy Plate', 'Circuits', 'Orokin Cell', 'Detonite Ampule'],
  Jupiter: ['Alloy Plate', 'Salvage', 'Hexenon', 'Neural Sensors', 'Fieldron Sample'],
  Europa: ['Morphics', 'Rubedo', 'Control Module', 'Fieldron Sample'],
  Saturn: ['Nano Spores', 'Plastids', 'Orokin Cell', 'Detonite Ampule'],
  Uranus: ['Polymer Bundle', 'Plastids', 'Gallium', 'Detonite Ampule'],
  Neptune: ['Ferrite', 'Nano Spores', 'Control Module', 'Fieldron Sample'],
  Pluto: ['Alloy Plate', 'Plastids', 'Rubedo', 'Morphics', 'Fieldron Sample'],
  Sedna: ['Alloy Plate', 'Salvage', 'Rubedo', 'Detonite Ampule'],
  Eris: ['Nano Spores', 'Plastids', 'Neurodes', 'Mutagen Sample'],
  Void: ['Ferrite', 'Rubedo', 'Argon Crystal', 'Control Module'],
  'Kuva Fortress': ['Salvage', 'Circuits', 'Neural Sensors', 'Detonite Ampule'],
};

const BOUNTY_SECTIONS = [
  ['cetusRewards', 'solarisRewards', 'Earth'],
  ['solarisRewards', 'deimosRewards', 'Venus'],
  ['deimosRewards', 'zarimanRewards', 'Deimos'],
  ['zarimanRewards', 'entratiLabRewards', 'Zariman'],
  ['entratiLabRewards', 'hexRewards', 'Deimos'],
  ['hexRewards', 'modByAvatar', 'Höllvania'],
];

const RELIC_NAME = /^(Lith|Meso|Neo|Axi|Requiem) \S+ Relic( \(\w+\))?$/;

const QTY = /^(\d[\d,]*)(X)? (.+)$/;
const hasQty = (q) => q && (q[2] || /Endo$|Credits Cache$/.test(q[3]));
const FRAME_COMP = /^(.+?) (Neuroptics|Chassis|Systems)( Blueprint)?$/;
const GEAR_PART = /(Blueprint|Barrel|Receiver|Stock|Blade|Blades|Handle|Hilt|Link|Grip|String|Limb|Guard|Gauntlet|Pouch|Head|Disc|Chain|Ornament|Boot|Heatsink|Motor|Subcortex|Casing|Core|Capsule|Engine|Avionics)$/;

function walkTable(sec, onRow) {
  const rowRe = /<tr[^>]*>(.*?)<\/tr>/gs;
  let loc = null, rot = null, m;
  while ((m = rowRe.exec(sec)) !== null) {
    const row = m[1];
    const th = row.match(/<th[^>]*>(.*?)<\/th>/);
    if (th) {
      const t = th[1].trim();
      if (/^Rotation\b/i.test(t)) rot = t.replace(/^Rotation\s+/i, '');
      else if (!/pad-cell/.test(row)) { loc = t; rot = null; }
      continue;
    }
    if (!loc) continue;
    const cells = [...row.matchAll(/<td[^>]*>([^<]*)<\/td>/g)].map((c) => c[1].trim()).filter(Boolean);
    if (cells.length < 2) continue;
    const cm = cells[cells.length - 1].match(/([\d.]+)%/);
    if (!cm) continue;
    onRow(loc, rot, cells[cells.length - 2].replace(/&#39;/g, "'").replace(/&amp;/g, '&'), parseFloat(cm[1]));
  }
}

function planetOfHeader(loc) {

  const extra = / Extra$/.test(loc);
  const h = parseHeader(loc.replace(/ Extra$/, ''));
  const { planet, type } = h;
  const node = extra ? h.node + ' (Extra)' : h.node;
  if (!planet) {
    if (/^Recall: Ten-Zero/i.test(loc)) return { planet: 'Zariman', node: loc, type: 'Recall' };
    return null;
  }
  if (/^Event:/i.test(planet)) return null;
  const p = planet.replace(/^.*,\s*/, '');
  return { planet: p, node, type };
}

function parseNodes(html, resourceNames) {
  const nodes = new Map();

  const qtyNames = new Set(Object.values(PLANET_RESOURCES).flat());
  const add = (planet, node, type, rot, raw, chance) => {
    const key = planet + '|' + node;
    let nd = nodes.get(key);
    if (!nd) { nd = { p: planet, n: node, t: type, r: {} }; nodes.set(key, nd); }
    const rk = rot || '';
    const bucket = nd.r[rk] || (nd.r[rk] = new Map());
    let name = raw, qty = null;
    const q = raw.match(QTY);
    if (hasQty(q) && !RELIC_NAME.test(raw)) { qty = q[1] + (q[2] ? 'x' : ''); name = q[3]; qtyNames.add(name); }
    const prev = bucket.get(name);
    if (!prev || chance > prev.chance) bucket.set(name, { chance, qty });
  };

  walkTable(sectionBetween(html, 'missionRewards', 'relicRewards'), (loc, rot, item, chance) => {
    if (EXCLUDE_LOCATION.test(loc)) return;
    const h = planetOfHeader(loc);
    if (h) add(h.planet, h.node, h.type, rot, item, chance);
  });
  for (const [from, to, planet] of BOUNTY_SECTIONS) {
    walkTable(sectionBetween(html, from, to), (loc, rot, item, chance) => {
      add(planet, loc.replace(/\s+Rewards?$/i, ''), 'Bounty', rot, item, chance);
    });
  }

  const names = new Set();
  for (const nd of nodes.values()) for (const b of Object.values(nd.r)) for (const n of b.keys()) names.add(n);

  const comps = new Map();
  for (const n of names) { const f = n.match(FRAME_COMP); if (f) comps.set(f[1], (comps.get(f[1]) || new Set()).add(f[2])); }
  const frameOwners = new Set([...comps].filter(([, c]) => c.size >= 2).map(([o]) => o));

  const classify = (n) => {
    if (RELIC_NAME.test(n)) return { kind: 'relic' };
    if (/Credits Cache$|^Endo$/.test(n)) return { kind: 'currency' };
    const f = n.match(FRAME_COMP);
    if (f && frameOwners.has(f[1])) return { kind: 'frame', owner: f[1] };
    const bp = n.match(/^(.+) Blueprint$/);
    if (bp && frameOwners.has(bp[1])) return { kind: 'frame', owner: bp[1] };
    if (qtyNames.has(n) || resourceNames.has(n)) return { kind: 'resource' };
    if (GEAR_PART.test(n)) return { kind: 'gear', owner: n.replace(new RegExp(' ' + GEAR_PART.source), '').replace(/ (Barrel|Receiver|Stock|Blade|Handle)$/, '') };
    return { kind: 'other' };
  };

  const itemIndex = new Map();
  const items = [];
  const idx = (n) => {
    if (!itemIndex.has(n)) { itemIndex.set(n, items.length); items.push({ name: n, ...classify(n) }); }
    return itemIndex.get(n);
  };
  const out = [...nodes.values()].map((nd) => {
    const r = {};
    for (const rk of Object.keys(nd.r).sort()) {
      r[rk] = [...nd.r[rk]].sort((a, b) => b[1].chance - a[1].chance)
        .map(([n, v]) => (v.qty ? [idx(n), v.chance, v.qty] : [idx(n), v.chance]));
    }
    return { p: nd.p, n: nd.n, t: nd.t, r };
  });
  return { nodes: out, items };
}

async function main() {
  console.log('Загружаю официальный droptable Digital Extremes...');
  const html = await fetchWithRetry(DROPTABLE_URL, { cacheFile: HTML_CACHE });

  const catMap = new Map();
  const baseCatMap = new Map();
  const savedCat = new Map();
  const imageMap = new Map();
  const resourceNames = new Set();
  const savedImg = new Map();
  try {
    const saved = JSON.parse(await readFile(IMG_FILE, 'utf8'));
    for (const [k, v] of Object.entries(saved)) savedImg.set(k, v);
  } catch {  }
  try {
    const saved = JSON.parse(await readFile(CAT_FILE, 'utf8'));
    for (const [k, v] of Object.entries(saved)) savedCat.set(k, v);
  } catch {  }
  try {
    console.log('Загружаю категории из warframestat (обогащение)...');
    const items = await fetchWithRetry(ITEMS_URL, { json: true, cacheFile: ITEMS_CACHE });
    for (const i of items) {
      if (i.imageName) imageMap.set(i.name, i.imageName);
      if (i.category === 'Resources') resourceNames.add(i.name);
      const cat = categoryFromWarframestat(i);
      if (i.isPrime) catMap.set(i.name, cat);
      else baseCatMap.set(i.name, cat);
    }
  } catch (e) {
    console.log(`⚠ warframestat недоступен (${e.message}) — категории беру из коммитнутого запаса.`);
  }

  const relicContents = parseRelicContents(html);
  const relicDrops = parseRelicDrops(html);
  console.log(`Реликвий с содержимым: ${relicContents.size} | падающих в миссиях: ${relicDrops.size}`);

  const order = { Rare: 0, Uncommon: 1, Common: 2 };
  const relics = [];
  const partDrops = new Map();
  const availOwners = new Set();

  for (const [id, content] of [...relicContents].sort((a, b) => a[0].localeCompare(b[0]))) {
    const byLoc = relicDrops.get(id);
    if (!byLoc) continue;
    const rewards = [...content.rewards.values()];
    rewards.sort((a, b) => order[a.rarity] - order[b.rarity] || a.item.localeCompare(b.item));

    for (const rw of rewards) {
      const owner = ownerOf(rw.item);
      rw.available = Boolean(owner);
      if (owner) {
        availOwners.add(owner);
        const list = partDrops.get(rw.item) || [];
        list.push({ relic: id, tier: content.tier, rarity: rw.rarity, chances: rw.chances });
        partDrops.set(rw.item, list);
      }
    }

    const missions = [...byLoc.values()].sort((a, b) => b.chance - a.chance);
    relics.push({
      id, tier: content.tier, code: content.code,
      image: `Relic${content.tier}D.png`,
      rewards: rewards.map((rw) => ({ item: rw.item, rarity: rw.rarity, available: rw.available, chances: rw.chances })),
      missions,
    });
  }

  const items = [...availOwners].map((name) => {
    const parts = [];
    for (const [partName, drops] of partDrops) {
      if (ownerOf(partName) === name) parts.push({ name: partName, short: shortPart(partName, name), drops });
    }
    parts.sort((a, b) => a.name.localeCompare(b.name));
    const isFrame = parts.some((p) => FRAME_PART.test(p.short));
    const baseName = name.replace(/ Prime$/, '');
    const category = isFrame
      ? 'Warframe'
      : (catMap.get(name) || baseCatMap.get(baseName) || savedCat.get(name) || null);
    return { name, image: `${name.replace(/\s+/g, '')}.png`, category, parts };
  })
    .filter((it) => it.parts.length > 0)
    .sort((a, b) => a.name.localeCompare(b.name));

  if (relics.length < 20 || items.length < 8) {
    throw new Error(`Подозрительно мало данных (реликвий ${relics.length}, предметов ${items.length}) — прерываю, чтобы не сломать сайт.`);
  }

  const out = {
    generatedAt: new Date().toISOString(),
    states: STATES,
    cdn: CDN,
    counts: { items: items.length, relics: relics.length, parts: partDrops.size },
    items,
    relics,
  };

  await mkdir(OUT_DIR, { recursive: true });
  await writeFile(OUT_FILE, JSON.stringify(out));

  const cats = Object.fromEntries(savedCat);
  for (const it of items) if (it.category) cats[it.name] = it.category;
  await writeFile(CAT_FILE, JSON.stringify(cats, null, 2) + '\n');

  const atlas = parseNodes(html, resourceNames);
  if (atlas.nodes.length < 300) {
    throw new Error(`Подозрительно мало узлов карты (${atlas.nodes.length}) — прерываю.`);
  }

  const imgs = Object.fromEntries(savedImg);
  for (const [k, v] of imageMap) imgs[k] = v;
  const wanted = new Set();
  for (const it of atlas.items) { wanted.add(it.name); if (it.owner) wanted.add(it.owner); }
  for (const list of Object.values(PLANET_RESOURCES)) for (const r of list) wanted.add(r);
  const images = {};
  for (const n of wanted) if (imgs[n]) images[n] = imgs[n];
  for (const it of atlas.items) {
    const im = images[it.name] || (it.owner && images[it.owner]);
    if (im) it.img = im;
  }
  const atlasOut = {
    generatedAt: out.generatedAt,
    cdn: CDN,
    planets: Object.fromEntries(Object.entries(PLANET_RESOURCES).map(([p, res]) => [p, res.map((r) => [r, images[r] || null])])),
    items: atlas.items,
    nodes: atlas.nodes,
  };
  await writeFile(ATLAS_FILE, JSON.stringify(atlasOut));
  await writeFile(IMG_FILE, JSON.stringify(Object.fromEntries(Object.entries({ ...Object.fromEntries(savedImg), ...images }).sort()), null, 0) + '\n');
  const kinds = {};
  for (const it of atlas.items) kinds[it.kind] = (kinds[it.kind] || 0) + 1;
  console.log(`Карта: ${ATLAS_FILE} (${(JSON.stringify(atlasOut).length / 1024).toFixed(1)} KB) | узлов: ${atlas.nodes.length} | предметы: ${JSON.stringify(kinds)}`);

  const totalMissions = relics.reduce((s, r) => s + r.missions.length, 0);
  console.log(`\nГотово: ${OUT_FILE} (${(JSON.stringify(out).length / 1024).toFixed(1)} KB)`);
  console.log(`Предметы: ${out.counts.items} | реликвии: ${out.counts.relics} | детали: ${out.counts.parts} | источников: ${totalMissions}`);
  const byCat = {};
  for (const it of items) byCat[it.category || 'unknown'] = (byCat[it.category || 'unknown'] || 0) + 1;
  console.log('По категориям:', JSON.stringify(byCat));
}

main().catch((err) => { console.error('Ошибка сборки:', err.message); process.exit(1); });
