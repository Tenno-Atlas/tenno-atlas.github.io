// Проверка данных карты. Запуск: node tools/test-atlas.cjs (после node tools/build-data.mjs)
// Ловит поломку парсера droptable: пропавшие планеты, битые индексы, потерянные боссы/ресурсы.
const A = require('../data/atlas.json');
const P = require('../data/primes.json');
let fail = 0;
const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) fail++; };

// планеты, которые нарисованы на карте (js/atlas.js LAYOUT)
const src = require('node:fs').readFileSync(require('node:path').join(__dirname, '..', 'js', 'atlas.js'), 'utf8');
const layout = new Set([...src.matchAll(/\['([^']+)', \d+, \d+, \d+, '#/g)].map((m) => m[1]));
const planets = new Set(A.nodes.map((n) => n.p));
const missing = [...planets].filter((p) => !layout.has(p));
ok(missing.length === 0, `every planet with nodes is on the map${missing.length ? ' — missing: ' + missing.join(', ') : ''}`);
ok(planets.size >= 18, `planets with nodes: ${planets.size}`);
ok(A.nodes.length >= 300, `nodes: ${A.nodes.length}`);

const bad = A.nodes.some((n) => Object.values(n.r).some((d) => d.some(([i, ch]) => !A.items[i] || !(ch > 0 && ch <= 100))));
ok(!bad, 'all drop rows point to a valid item with 0 < chance <= 100');

const node = (p, n) => A.nodes.find((x) => x.p === p && x.n === n);
const has = (nd, name) => nd && Object.values(nd.r).some((d) => d.some(([i]) => A.items[i].name === name));
ok(has(node('Mercury', 'Tolstoj'), 'Seer Barrel'), 'Mercury/Tolstoj drops Seer parts (boss)');
ok(A.items.some((i) => i.kind === 'frame' && i.owner === 'Rhino'), 'Rhino parts are classified as warframe parts');
ok(A.items.find((i) => i.name === 'Argon Crystal')?.kind === 'resource', 'Argon Crystal is a resource');
ok((A.planets.Void || []).some(([r]) => r === 'Argon Crystal'), 'Void lists Argon Crystal as a planet resource');

// реликвии из планировщика реально находятся на карте
const relicOnMap = new Set(A.items.filter((i) => i.kind === 'relic').map((i) => i.name.replace(/ Relic.*$/, '')));
const lost = P.relics.filter((r) => !relicOnMap.has(r.id) && r.missions.some((m) => m.planet && !/^Event/.test(m.planet)));
ok(lost.length === 0, `prime relics that drop on planets are on the map${lost.length ? ' — lost: ' + lost.map((r) => r.id).join(', ') : ''}`);

console.log(fail ? `\n${fail} FAILED` : '\nALL PASS');
process.exit(fail ? 1 : 0);
