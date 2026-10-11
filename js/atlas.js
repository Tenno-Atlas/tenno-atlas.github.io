// Tenno Atlas — состояние страницы (Alpine store) и отрисовка звёздной карты.
// Данные: data/atlas.json (что падает на каждом узле) + data/primes.json (реликвии и праймы).
// Названия предметов — как в игре (EN); переводится интерфейс, планеты и типы миссий.
(function () {
  'use strict';

  const I18N = {
    en: {
      tagline: 'Warframe farm map', loading: 'Loading star chart…', data_error: 'Could not load data',
      planner: 'Farm planner', tab_prime: 'Prime', tab_frames: 'Warframes',
      planner_hint: 'Pick a part or the whole set — the map lights up where to farm it.',
      filter: 'Filter…', full_set: 'Full set', clear: 'Clear', selected: 'Selected',
      best_spots: 'Best spots', best_hint: 'Chance per reward to get something you need. Several needed drops on one node add up.',
      nothing_sel: 'Nothing selected yet.', nothing: 'Nothing found',
      search: 'Drop search', search_ph: 'Resource, part, relic, mod…', search_hint: 'Try: Argon Crystal, Rhino, Neo C8, Orokin Cell',
      drops_at: 'Where it drops', planet_res: 'Planet resource', from_enemies: 'drops from enemies & containers on the planet',
      add_plan: 'Add to planner', in_plan: 'In planner',
      back: 'Star chart', nodes: 'nodes', resources: 'Resources', bosses: 'Warframe parts', relics: 'Relics',
      rot: 'Rot.', node_details: 'Node', close: 'Close', click_hint: 'Click a planet to open its nodes',
      your: 'Your drops', more: 'more', data_sync: 'Data', footer: 'Fan project · not affiliated with Digital Extremes',
      updated: 'Data refreshed',
      kind: { relic: 'Relic', frame: 'Warframe part', gear: 'Weapon / gear', resource: 'Resource', currency: 'Credits / Endo', other: 'Mods & other', prime: 'Prime part' },
    },
    ru: {
      tagline: 'Карта фарма Warframe', loading: 'Загрузка звёздной карты…', data_error: 'Не удалось загрузить данные',
      planner: 'Планировщик фарма', tab_prime: 'Прайм', tab_frames: 'Варфреймы',
      planner_hint: 'Выбери деталь или весь сет — карта подсветит, где фармить.',
      filter: 'Фильтр…', full_set: 'Весь сет', clear: 'Сбросить', selected: 'Выбрано',
      best_spots: 'Лучшие места', best_hint: 'Шанс за награду получить что-то нужное. Если на узле несколько нужных дропов — шансы складываются.',
      nothing_sel: 'Пока ничего не выбрано.', nothing: 'Ничего не найдено',
      search: 'Поиск дропа', search_ph: 'Ресурс, деталь, реликвия, мод…', search_hint: 'Например: Argon Crystal, Rhino, Neo C8, Orokin Cell',
      drops_at: 'Где падает', planet_res: 'Ресурс планеты', from_enemies: 'падает с врагов и ящиков на планете',
      add_plan: 'В планировщик', in_plan: 'В планировщике',
      back: 'Звёздная карта', nodes: 'узлов', resources: 'Ресурсы', bosses: 'Части варфреймов', relics: 'Реликвии',
      rot: 'Рот.', node_details: 'Узел', close: 'Закрыть', click_hint: 'Нажми на планету, чтобы открыть её узлы',
      your: 'Твой дроп', more: 'ещё', data_sync: 'Данные', footer: 'Фан-проект · не связан с Digital Extremes',
      updated: 'Данные обновлены',
      kind: { relic: 'Реликвия', frame: 'Часть варфрейма', gear: 'Оружие / снаряжение', resource: 'Ресурс', currency: 'Кредиты / Эндо', other: 'Моды и прочее', prime: 'Прайм-деталь' },
    },
  };

  const PLANET_RU = {
    Mercury: 'Меркурий', Venus: 'Венера', Earth: 'Земля', Lua: 'Луна', Mars: 'Марс', Phobos: 'Фобос',
    Deimos: 'Деймос', Ceres: 'Церера', Jupiter: 'Юпитер', Europa: 'Европа', Saturn: 'Сатурн', Uranus: 'Уран',
    Neptune: 'Нептун', Pluto: 'Плутон', Sedna: 'Седна', Eris: 'Эрида', Void: 'Бездна', 'Kuva Fortress': 'Крепость Кувы',
    Zariman: 'Зариман', Duviri: 'Дувири', 'Höllvania': 'Хёлльвания', 'Veil Proxima': 'Проксима Завесы', Sanctuary: 'Святилище',
  };
  const TYPE_RU = {
    Survival: 'Выживание', Defense: 'Оборона', 'Mobile Defense': 'Мобильная оборона', Interception: 'Перехват',
    Excavation: 'Раскопки', Exterminate: 'Зачистка', Capture: 'Захват', Rescue: 'Спасение', Spy: 'Шпионаж',
    Sabotage: 'Диверсия', Assassination: 'Убийство', Disruption: 'Разрушение', Skirmish: 'Стычка', Caches: 'Тайники',
    Bounty: 'Баунти', Defection: 'Дезертирство', Arena: 'Арена', 'Infested Salvage': 'Утилизация заражённых',
    'Void Flood': 'Затопление Бездны', 'Void Cascade': 'Каскад Бездны', 'Void Armageddon': 'Армагеддон Бездны',
    Alchemy: 'Алхимия', Ascension: 'Вознесение', Recall: 'Отзыв', 'Sanctuary Onslaught': 'Натиск Святилища',
    'Shrine Defense': 'Оборона святыни', Pursuit: 'Преследование', Rush: 'Рывок', Normal: 'Обычный', Hard: 'Сложный',
  };

  // Звёздная карта: координаты в viewBox 1000×640 (по мотивам внутриигровой карты).
  const LAYOUT = [
    ['Sedna', 470, 70, 15, '#c7b3a1'], ['Phobos', 625, 120, 11, '#9c8576'], ['Veil Proxima', 880, 95, 12, '#6f86c9'],
    ['Höllvania', 120, 95, 13, '#c45a7c'], ['Kuva Fortress', 285, 185, 13, '#b8323e'], ['Ceres', 420, 170, 12, '#8a8f99'],
    ['Mars', 600, 215, 15, '#c4562f'], ['Eris', 760, 200, 14, '#7f9a52'], ['Deimos', 510, 255, 12, '#a3486a'],
    ['Void', 150, 300, 15, '#d9c56b'], ['Europa', 275, 315, 13, '#a9c9d9'], ['Jupiter', 385, 300, 22, '#d1a074'],
    ['Earth', 640, 330, 17, '#4b8ccc'], ['Lua', 720, 355, 10, '#cfcfd6'], ['Pluto', 845, 330, 13, '#9db0c6'],
    ['Mercury', 470, 405, 11, '#a7958a'], ['Venus', 575, 440, 15, '#d8b267'], ['Zariman', 150, 460, 13, '#7fd1c7'],
    ['Saturn', 330, 470, 19, '#cdb486'], ['Duviri', 870, 470, 14, '#d07fb5'], ['Neptune', 690, 540, 16, '#4c6fd6'],
    ['Uranus', 465, 560, 15, '#7ec2c8'], ['Sanctuary', 860, 590, 10, '#e3e3e3'],
  ].map(([name, x, y, r, color]) => ({ name, x, y, r, color }));

  const KIND_ORDER = ['relic', 'frame', 'gear', 'resource', 'currency', 'other'];
  const KIND_COLOR = { relic: '#e8455c', frame: '#ece0cb', gear: '#c9a46a', resource: '#7fb0a8', currency: '#a3938b', other: '#8a7a9e', prime: '#e8455c' };

  const safe = (fn, d) => { try { return fn(); } catch (e) { return d; } };
  const lsGet = (k) => safe(() => localStorage.getItem(k), null);
  const lsSet = (k, v) => safe(() => localStorage.setItem(k, v));
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const relicBase = (n) => n.replace(/ Relic.*$/, '');
  const round = (n) => Math.round(n * 100) / 100;

  // Звёзды фона — фиксированный псевдослучайный набор (без мерцания при перерисовке).
  let seed = 7;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const STARS = Array.from({ length: 170 }, () => `<circle cx="${(rnd() * 1000).toFixed(1)}" cy="${(rnd() * 640).toFixed(1)}" r="${(rnd() * 1.1 + 0.2).toFixed(2)}" opacity="${(rnd() * 0.6 + 0.15).toFixed(2)}"/>`).join('');

  document.addEventListener('alpine:init', () => {
    window.Alpine.store('wf', {
      loaded: false, error: '', toast: '',
      lang: lsGet('wf_lang') === 'ru' ? 'ru' : 'en', // по умолчанию EN
      A: { items: [], nodes: [], planets: {}, cdn: '' }, P: { items: [], relics: [] },
      generatedAt: null, loadedAt: 0,
      tab: 'prime', filter: '', open: {},
      sel: safe(() => JSON.parse(lsGet('wf_atlas_sel')) || {}, {}),
      q: '', focus: null,         // фокус поиска: имя предмета
      view: null,                 // открытая планета или null (вся карта)
      pinned: null,               // ключ узла, раскрытого справа
      tip: { show: false, x: 0, y: 0, html: '' },
      // вычисляемое (пересчитывается явно, чтобы карта не перерисовывалась на каждый чих)
      planHits: new Map(), planPlanets: {}, ranking: [], findHits: new Map(), findPlanets: {}, mapHtml: '',

      async load(silent) {
        try {
          const get = (u) => fetch(u + '?t=' + Date.now(), { cache: 'no-store' }).then((r) => { if (!r.ok) throw new Error(u + ' HTTP ' + r.status); return r.json(); });
          const [A, P] = await Promise.all([get('data/atlas.json'), get('data/primes.json')]);
          const changed = this.generatedAt && this.generatedAt !== A.generatedAt;
          A.nodes.forEach((n) => { n.key = n.p + '|' + n.n; });
          this.A = A; this.P = P; this.generatedAt = A.generatedAt; this.loadedAt = Date.now();
          this.nodeByKey = new Map(A.nodes.map((n) => [n.key, n]));
          this.frames = this.buildFrames();
          this._idx = null;
          this.loaded = true; this.error = '';
          this.recalc();
          if (this.focus) this.setFocus(this.focus);
          if (changed && silent) this.flash(this.t('updated'));
        } catch (e) {
          if (!silent) this.error = String((e && e.message) || e);
        }
      },
      // Сайт открыт долго (вкладка висит днями) — подтягиваем свежий дроп при возвращении.
      refreshIfStale() { if (this.loaded && Date.now() - this.loadedAt > 30 * 60 * 1000) this.load(true); },
      flash(msg) { this.toast = msg; setTimeout(() => { this.toast = ''; }, 3500); },

      // ---------- i18n ----------
      t(k) { const d = I18N[this.lang]; return d[k] != null ? d[k] : I18N.en[k] != null ? I18N.en[k] : k; },
      kindName(k) { return (I18N[this.lang].kind || {})[k] || k; },
      planetName(p) { return this.lang === 'ru' ? (PLANET_RU[p] || p) : p; },
      typeName(t) { return !t ? '' : this.lang === 'ru' ? (TYPE_RU[t] || t) : t; },
      toggleLang() { this.lang = this.lang === 'en' ? 'ru' : 'en'; lsSet('wf_lang', this.lang); this.renderMap(); },

      // ---------- утилиты ----------
      img(name) { return name ? this.A.cdn + encodeURIComponent(name) : ''; },
      itemImg(it) {
        if (it.kind === 'relic') return this.img('Relic' + it.name.split(' ')[0] + 'D.png');
        return it.img ? this.img(it.img) : '';
      },
      fmt(n) { return n == null ? '' : (Math.round(n * 100) / 100) + '%'; },
      kindColor(k) { return KIND_COLOR[k] || '#a3938b'; },
      dateStr() { return this.generatedAt ? new Date(this.generatedAt).toLocaleDateString(this.lang === 'ru' ? 'ru-RU' : 'en-GB') : ''; },
      layout() { return LAYOUT; },

      // ---------- планировщик ----------
      // Обычные варфреймы: группируем части по владельцу (Rhino -> BP/Neuroptics/Chassis/Systems).
      buildFrames() {
        const map = new Map();
        this.A.items.forEach((it) => {
          if (it.kind !== 'frame') return;
          const f = map.get(it.owner) || { name: it.owner, img: null, parts: [] };
          f.parts.push({ name: it.name, short: it.name.slice(it.owner.length).trim().replace(/ Blueprint$/, '') || 'Blueprint' });
          if (!f.img && it.img) f.img = it.img;
          map.set(it.owner, f);
        });
        const order = ['Blueprint', 'Neuroptics', 'Chassis', 'Systems'];
        return [...map.values()].map((f) => { f.parts.sort((a, b) => order.indexOf(a.short) - order.indexOf(b.short)); return f; })
          .sort((a, b) => a.name.localeCompare(b.name));
      },
      plannerList() {
        const q = this.filter.trim().toLowerCase();
        const list = this.tab === 'prime'
          ? this.P.items.map((i) => ({ name: i.name, img: i.image, parts: i.parts.map((p) => ({ name: p.name, short: p.short })), pre: 'p:' }))
          : this.frames.map((f) => ({ ...f, pre: 'a:' }));
        return q ? list.filter((i) => i.name.toLowerCase().includes(q) || i.parts.some((p) => p.name.toLowerCase().includes(q))) : list;
      },
      isSel(pre, name) { return !!this.sel[pre + name]; },
      toggle(pre, name) {
        const k = pre + name;
        if (this.sel[k]) delete this.sel[k]; else this.sel[k] = true;
        this.saveSel();
      },
      allSel(item) { return item.parts.every((p) => this.sel[item.pre + p.name]); },
      someSel(item) { return item.parts.some((p) => this.sel[item.pre + p.name]); },
      toggleSet(item) {
        const on = !this.allSel(item);
        item.parts.forEach((p) => { if (on) this.sel[item.pre + p.name] = true; else delete this.sel[item.pre + p.name]; });
        this.open[item.name] = true;
        this.saveSel();
      },
      clearSel() { this.sel = {}; this.saveSel(); },
      saveSel() { lsSet('wf_atlas_sel', JSON.stringify(this.sel)); this.recalc(); },
      get selList() { return Object.keys(this.sel).filter((k) => this.sel[k]).map((k) => ({ key: k, name: k.slice(2) })); },

      // ---------- расчёт подсветки ----------
      recalc() {
        // нужные реликвии: реликвия -> какие из выбранных прайм-деталей в ней лежат
        const wantRelic = new Map();
        for (const r of this.P.relics || []) {
          const parts = r.rewards.filter((rw) => this.sel['p:' + rw.item]).map((rw) => ({ name: rw.item, chance: rw.chances.Intact }));
          if (parts.length) wantRelic.set(r.id, parts);
        }
        const wantItem = new Set();
        this.A.items.forEach((it, i) => { if (this.sel['a:' + it.name]) wantItem.add(i); });

        const hits = new Map();
        if (wantRelic.size || wantItem.size) {
          for (const nd of this.A.nodes) {
            let best = null;
            for (const [rot, drops] of Object.entries(nd.r)) {
              let sum = 0; const lines = [];
              for (const [i, ch] of drops) {
                const it = this.A.items[i];
                const rel = it.kind === 'relic' && wantRelic.get(relicBase(it.name));
                if (rel || wantItem.has(i)) { sum += ch; lines.push({ name: it.name, chance: ch, parts: rel ? rel.map((p) => p.name) : null }); }
              }
              if (sum > 0 && (!best || sum > best.eff)) best = { eff: round(sum), rot, lines };
            }
            if (best) hits.set(nd.key, { ...best, node: nd });
          }
        }
        this.planHits = hits;
        this.ranking = [...hits.values()].sort((a, b) => b.eff - a.eff).slice(0, 40);
        this.planPlanets = this.byPlanet(hits);
        this.renderMap();
      },
      byPlanet(hits) {
        const out = {};
        for (const h of hits.values()) {
          const p = out[h.node.p] || (out[h.node.p] = { count: 0, best: 0 });
          p.count++; p.best = Math.max(p.best, h.eff);
        }
        return out;
      },

      // ---------- поиск дропа ----------
      searchIndex() {
        if (this._idx) return this._idx;
        const seen = new Map();
        this.A.items.forEach((it, i) => { if (!seen.has(it.name)) seen.set(it.name, { name: it.name, kind: it.kind, img: this.itemImg(it), idx: i }); });
        for (const res of Object.values(this.A.planets)) for (const [r, img] of res) if (!seen.has(r)) seen.set(r, { name: r, kind: 'resource', img: img ? this.img(img) : '', idx: -1 });
        for (const it of this.P.items) for (const p of it.parts) seen.set(p.name, { name: p.name, kind: 'prime', img: this.img(it.image), idx: -1 });
        return (this._idx = [...seen.values()]);
      },
      results() {
        const q = this.q.trim().toLowerCase();
        if (q.length < 2) return [];
        const res = this.searchIndex().filter((e) => e.name.toLowerCase().includes(q));
        res.sort((a, b) => (a.name.toLowerCase().startsWith(q) ? 0 : 1) - (b.name.toLowerCase().startsWith(q) ? 0 : 1)
          || KIND_ORDER.indexOf(a.kind) - KIND_ORDER.indexOf(b.kind) || a.name.localeCompare(b.name));
        return res.slice(0, 40);
      },
      pick(e) {
        if (e.kind === 'prime') { this.toggle('p:', e.name); this.tab = 'prime'; }
        this.setFocus(this.focus === e.name ? null : e.name);
      },
      setFocus(name) {
        this.focus = name;
        const hits = new Map(); const planets = {};
        if (name) {
          // прайм-деталь ищем через реликвии, остальное — напрямую по таблицам узлов
          const relics = new Set((this.P.relics || []).filter((r) => r.rewards.some((rw) => rw.item === name)).map((r) => r.id));
          for (const nd of this.A.nodes) {
            let best = null;
            for (const [rot, drops] of Object.entries(nd.r)) {
              for (const [i, ch, qty] of drops) {
                const it = this.A.items[i];
                if ((it.name === name || (relics.size && it.kind === 'relic' && relics.has(relicBase(it.name)))) && (!best || ch > best.eff)) {
                  best = { eff: ch, rot, qty, via: it.name !== name ? it.name : null };
                }
              }
            }
            if (best) hits.set(nd.key, { ...best, node: nd });
          }
          for (const [p, res] of Object.entries(this.A.planets)) if (res.some(([r]) => r === name)) planets[p] = true;
        }
        this.findHits = hits;
        this.findPlanets = planets;
        this.renderMap();
      },
      focusList() { return [...this.findHits.values()].sort((a, b) => b.eff - a.eff).slice(0, 60); },
      focusResPlanets() { return Object.keys(this.findPlanets); },

      // ---------- навигация по карте ----------
      openPlanet(p, nodeKey) {
        this.view = p; this.hideTip();
        if (nodeKey) this.pinned = nodeKey;
        const el = document.getElementById('map-pane');
        if (el && window.innerWidth < 1024) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      },
      pin(key) {
        this.pinned = key; this.hideTip();
        // на телефоне детали узла — ниже карты, прокручиваем к ним
        if (window.innerWidth < 1024) setTimeout(() => { const el = document.getElementById('details'); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 50);
      },
      closePlanet() { this.view = null; this.hideTip(); },
      planetNodes() {
        if (!this.view) return [];
        const nodes = this.A.nodes.filter((n) => n.p === this.view);
        const score = (n) => (this.planHits.get(n.key) ? 2 : 0) + (this.findHits.get(n.key) ? 1 : 0);
        return nodes.sort((a, b) => score(b) - score(a) || (a.t || '').localeCompare(b.t || '') || a.n.localeCompare(b.n));
      },
      planetInfo(p) {
        const nodes = this.A.nodes.filter((n) => n.p === p);
        const frames = new Set(); const tiers = {};
        for (const nd of nodes) for (const drops of Object.values(nd.r)) for (const [i] of drops) {
          const it = this.A.items[i];
          if (it.kind === 'frame') frames.add(it.owner);
          if (it.kind === 'relic') tiers[it.name.split(' ')[0]] = true;
        }
        return { nodes: nodes.length, frames: [...frames].sort(), tiers: ['Lith', 'Meso', 'Neo', 'Axi', 'Requiem'].filter((t) => tiers[t]), res: this.A.planets[p] || [] };
      },
      nodeGroups(nd, limit) {
        // ротация -> предметы, сгруппированные по виду
        return Object.entries(nd.r).map(([rot, drops]) => {
          const rows = drops.map(([i, ch, qty]) => ({ it: this.A.items[i], ch, qty }))
            .sort((a, b) => KIND_ORDER.indexOf(a.it.kind) - KIND_ORDER.indexOf(b.it.kind) || b.ch - a.ch);
          return { rot, rows: limit ? rows.slice(0, limit) : rows, hidden: limit ? Math.max(0, rows.length - limit) : 0 };
        });
      },
      isWanted(nd, it) {
        const h = this.planHits.get(nd.key);
        const f = this.findHits.get(nd.key);
        return (h && h.lines.some((l) => l.name === it.name)) || (f && (it.name === this.focus || f.via === it.name));
      },

      // ---------- тултипы ----------
      showTip(ev, html) { this.tip = { show: true, html, ...this.tipPos(ev) }; },
      moveTip(ev) { if (this.tip.show) Object.assign(this.tip, this.tipPos(ev)); },
      hideTip() { this.tip.show = false; },
      tipPos(ev) {
        const w = 340, h = 380, pad = 16;
        let x = ev.clientX + pad, y = ev.clientY + pad;
        if (x + w > window.innerWidth) x = Math.max(8, ev.clientX - w - pad);
        if (y + h > window.innerHeight) y = Math.max(8, window.innerHeight - h - 8);
        return { x, y };
      },
      planetTip(p) {
        const info = this.planetInfo(p);
        const plan = this.planPlanets[p]; const find = this.findHits.size ? [...this.findHits.values()].filter((h) => h.node.p === p) : [];
        let h = `<div class="tip-h">${esc(this.planetName(p))}<span>${info.nodes} ${esc(this.t('nodes'))}</span></div>`;
        if (plan) h += `<div class="tip-hit">● ${esc(this.t('your'))}: ${plan.count} · ${this.fmt(plan.best)}</div>`;
        if (find.length || this.findPlanets[p]) h += `<div class="tip-find">● ${esc(this.focus)}${find.length ? ': ' + find.length + ' · ' + this.fmt(Math.max(...find.map((f) => f.eff))) : ''}</div>`;
        if (info.res.length) {
          h += `<div class="tip-s">${esc(this.t('resources'))}</div><div class="tip-res">`;
          for (const [r, img] of info.res) h += `<span>${img ? `<img src="${this.img(img)}" alt="" onerror="this.remove()">` : ''}${esc(r)}</span>`;
          h += '</div>';
        }
        if (info.frames.length) h += `<div class="tip-s">${esc(this.t('bosses'))}</div><div class="tip-t">${info.frames.map(esc).join(', ')}</div>`;
        if (info.tiers.length) h += `<div class="tip-s">${esc(this.t('relics'))}</div><div class="tip-t">${info.tiers.join(' · ')}</div>`;
        h += `<div class="tip-foot">${esc(this.t('click_hint'))}</div>`;
        return h;
      },
      nodeTip(nd) {
        let h = `<div class="tip-h">${esc(nd.n)}<span>${esc(this.typeName(nd.t))}</span></div>`;
        for (const g of this.nodeGroups(nd, 9)) {
          if (g.rot) h += `<div class="tip-s">${esc(this.t('rot'))} ${esc(g.rot)}</div>`;
          for (const r of g.rows) {
            const want = this.isWanted(nd, r.it);
            h += `<div class="tip-row${want ? ' want' : ''}"><i style="background:${this.kindColor(r.it.kind)}"></i><b>${r.qty ? esc(r.qty) + ' ' : ''}${esc(r.it.name)}</b><em>${this.fmt(r.ch)}</em></div>`;
          }
          if (g.hidden) h += `<div class="tip-more">+${g.hidden} ${esc(this.t('more'))}</div>`;
        }
        return h;
      },

      // ---------- SVG звёздной карты ----------
      renderMap() {
        const orbits = [70, 130, 195, 265, 340, 420].map((r) => `<ellipse cx="500" cy="330" rx="${r * 1.25}" ry="${r * 0.72}" class="orbit"/>`).join('');
        let planets = '';
        for (const pl of LAYOUT) {
          const plan = this.planPlanets[pl.name];
          const find = [...this.findHits.values()].some((h) => h.node.p === pl.name) || this.findPlanets[pl.name];
          const dim = (this.planHits.size || this.findHits.size || Object.keys(this.findPlanets).length) && !plan && !find;
          const label = esc(this.planetName(pl.name).toUpperCase());
          planets += `<g class="planet${dim ? ' dim' : ''}" data-planet="${esc(pl.name)}" tabindex="0" role="button" aria-label="${esc(this.planetName(pl.name))}">`
            + `<circle cx="${pl.x}" cy="${pl.y}" r="${pl.r + 16}" class="hitbox"/>`
            + (plan ? `<circle cx="${pl.x}" cy="${pl.y}" r="${pl.r + 9}" class="ring-plan"/>` : '')
            + (find ? `<circle cx="${pl.x}" cy="${pl.y}" r="${pl.r + (plan ? 14 : 9)}" class="ring-find"/>` : '')
            + `<circle cx="${pl.x}" cy="${pl.y}" r="${pl.r}" fill="url(#g-${pl.name.replace(/\W/g, '')})" class="body"/>`
            + `<text x="${pl.x}" y="${pl.y + pl.r + 17}" class="label">${label}</text>`
            + (plan ? `<g class="badge"><rect x="${pl.x + pl.r - 2}" y="${pl.y - pl.r - 14}" width="${String(plan.count).length * 7 + 10}" height="15"/><text x="${pl.x + pl.r + 3}" y="${pl.y - pl.r - 3}">${plan.count}</text></g>` : '')
            + '</g>';
        }
        const grads = LAYOUT.map((pl) => `<radialGradient id="g-${pl.name.replace(/\W/g, '')}" cx="35%" cy="32%" r="75%"><stop offset="0" stop-color="#fff" stop-opacity=".9"/><stop offset=".18" stop-color="${pl.color}"/><stop offset="1" stop-color="#0d0a0b"/></radialGradient>`).join('');
        this.mapHtml = `<svg viewBox="0 0 1000 640" preserveAspectRatio="xMidYMid meet" class="starmap" role="img" aria-label="Star chart">`
          + `<defs>${grads}<radialGradient id="sun" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#fff3d6"/><stop offset=".25" stop-color="#f0b46a" stop-opacity=".55"/><stop offset="1" stop-color="#c0233f" stop-opacity="0"/></radialGradient></defs>`
          + `<g class="stars">${STARS}</g><g>${orbits}</g><circle cx="500" cy="330" r="60" fill="url(#sun)"/><circle cx="500" cy="330" r="7" fill="#fff6e3"/>`
          + planets + '</svg>';
      },
      mapOver(ev) {
        const g = ev.target.closest && ev.target.closest('[data-planet]');
        if (!g) { this.hideTip(); return; }
        if (this._tipFor !== g.dataset.planet || !this.tip.show) { this._tipFor = g.dataset.planet; this.showTip(ev, this.planetTip(g.dataset.planet)); }
        else this.moveTip(ev);
      },
      mapLeave() { this._tipFor = null; this.hideTip(); },
      mapClick(ev) { const g = ev.target.closest && ev.target.closest('[data-planet]'); if (g) this.openPlanet(g.dataset.planet); },
      mapKey(ev) { const g = ev.target.closest && ev.target.closest('[data-planet]'); if (g && (ev.key === 'Enter' || ev.key === ' ')) { ev.preventDefault(); this.openPlanet(g.dataset.planet); } },
      pinnedNode() { return this.pinned ? this.nodeByKey.get(this.pinned) : null; },
    });

    const s = window.Alpine.store('wf');
    s.load();
    document.addEventListener('visibilitychange', () => { if (!document.hidden) s.refreshIfStale(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') { if (s.pinned) s.pinned = null; else if (s.view) s.closePlanet(); } });
  });
})();
