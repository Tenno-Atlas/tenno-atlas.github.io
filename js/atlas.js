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
      back: 'Star chart', duviri_tag: 'Another reality · The Duviri Paradox', nodes: 'nodes', resources: 'Resources', bosses: 'Warframe parts', relics: 'Relics',
      rot: 'Rot.', node_details: 'Node', close: 'Close', click_hint: 'Click a planet to fly to it',
      your: 'Your drops', more: 'more', data_sync: 'Data',
      updated: 'Data refreshed', mode_base: 'Early game', mode_late: 'Late game', mode_hint: 'Late game shows the Zariman and derelict ships (spoilers)',
      about: 'About', about_text: 'Fan-made Warframe farm map. Not affiliated with Digital Extremes. Drop data: official DE drop tables, updated daily.', credits: 'Planet textures: Solar System Scope (CC BY 4.0); Earth maps: NASA Blue Marble via three.js examples. Item icons and Duviri art: warframestat.us. Warframe and the Lotus logo © Digital Extremes Ltd.', origin: 'Origin System', planner_short: 'Planner', search_short: 'Search',
      controls: 'Drag — move · Wheel — zoom · Right drag — rotate',
      loot_frames: 'Warframes to build', loot_none: 'No warframe parts drop here.', loot_gear: 'Weapons & gear', click_hint_hub: 'Click to open the list', bonus: 'Bonus', missions: 'missions', hub_hint: 'Hover a mission to see its drops, click to pin it.',
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
      back: 'Звёздная карта', duviri_tag: 'Иная реальность · Парадокс Дувири', nodes: 'узлов', resources: 'Ресурсы', bosses: 'Части варфреймов', relics: 'Реликвии',
      rot: 'Рот.', node_details: 'Узел', close: 'Закрыть', click_hint: 'Нажми на планету, чтобы подлететь',
      your: 'Твой дроп', more: 'ещё', data_sync: 'Данные',
      updated: 'Данные обновлены', mode_base: 'Начало игры', mode_late: 'Поздняя игра', mode_hint: 'Поздняя игра показывает Зариман и обломки кораблей (спойлеры)',
      about: 'О сайте', about_text: 'Фанатская карта фарма Warframe. Не связана с Digital Extremes. Данные дропа: официальные таблицы DE, обновляются ежедневно.', credits: 'Текстуры планет: Solar System Scope (CC BY 4.0); карты Земли: NASA Blue Marble (примеры three.js). Иконки предметов и арт Дувири: warframestat.us. Warframe и логотип Лотоса © Digital Extremes Ltd.', origin: 'Система Origin', planner_short: 'Планер', search_short: 'Поиск',
      controls: 'Тянуть — двигать · Колесо — зум · Правая кнопка — вращать',
      loot_frames: 'Варфреймы для сборки', loot_none: 'Здесь не падают части варфреймов.', loot_gear: 'Оружие и снаряжение', click_hint_hub: 'Нажми, чтобы открыть список', bonus: 'Бонус', missions: 'миссий', hub_hint: 'Наведи на миссию, чтобы увидеть дроп, нажми — чтобы закрепить.',
      kind: { relic: 'Реликвия', frame: 'Часть варфрейма', gear: 'Оружие / снаряжение', resource: 'Ресурс', currency: 'Кредиты / Эндо', other: 'Моды и прочее', prime: 'Прайм-деталь' },
    },
  };

  const PLANET_RU = {
    Mercury: 'Меркурий', Venus: 'Венера', Earth: 'Земля', Lua: 'Луа', Mars: 'Марс', Phobos: 'Фобос',
    Deimos: 'Деймос', Ceres: 'Церера', Jupiter: 'Юпитер', Europa: 'Европа', Saturn: 'Сатурн', Uranus: 'Уран',
    Neptune: 'Нептун', Pluto: 'Плутон', Sedna: 'Седна', Eris: 'Эрида', Void: 'Бездна', 'Kuva Fortress': 'Крепость Кувы',
    Zariman: 'Зариман', Duviri: 'Дувири', 'Höllvania': 'Хёлльвания', 'Veil Proxima': 'Проксима Завесы', Sanctuary: 'Святилище',
  };
  const TYPE_RU = {
    Survival: 'Выживание', Defense: 'Оборона', 'Mobile Defense': 'Мобильная оборона', Interception: 'Перехват',
    Excavation: 'Раскопки', Exterminate: 'Зачистка', Capture: 'Захват', Rescue: 'Спасение', Spy: 'Шпионаж',
    Sabotage: 'Диверсия', Assassination: 'Убийство', Disruption: 'Сбой', Skirmish: 'Стычка', Caches: 'Тайники',
    Bounty: 'Баунти', Defection: 'Перебежчики', Arena: 'Арена', 'Infested Salvage': 'Утилизация заражённых',
    'Void Flood': 'Затопление Бездны', 'Void Cascade': 'Каскад Бездны', 'Void Armageddon': 'Армагеддон Бездны',
    Alchemy: 'Алхимия', Ascension: 'Вознесение', Recall: 'Отзыв', 'Sanctuary Onslaught': 'Натиск Святилища',
    'Shrine Defense': 'Оборона святыни', Pursuit: 'Преследование', Rush: 'Рывок', Normal: 'Обычный', Hard: 'Сложный',
  };

  const HUB_ORDER = ['cetus', 'fortuna', 'necralisk', 'sanctum', 'chrysalith', 'hex', 'bounty', 'perita', 'recall', 'railjack'];
  const HUB_TEXT = {
    en: {
      cetus: ['Cetus', 'Plains of Eidolon bounties'], fortuna: ['Fortuna', 'Orb Vallis bounties'], necralisk: ['Necralisk', 'Cambion Drift bounties'],
      sanctum: ['Sanctum Anatomica', 'Lab bounties'], chrysalith: ['Chrysalith', 'Zariman bounties'], hex: ['The Hex', 'Höllvania bounties'],
      bounty: ['Bounties', 'Bounties'], perita: ['The Perita Rebellion', 'Weekly'], recall: ['Recall: Ten-Zero', 'Weekly'], railjack: ['{p} Proxima', 'Railjack'],
    },
    ru: {
      cetus: ['Цетус', 'Баунти Равнин Эйдолона'], fortuna: ['Фортуна', 'Баунти Долины Сфер'], necralisk: ['Некралиск', 'Баунти Камбионского дрейфа'],
      sanctum: ['Санктум Анатомика', 'Баунти лаборатории'], chrysalith: ['Хризалит', 'Баунти Заримана'], hex: ['Гекс', 'Баунти Хёлльвании'],
      bounty: ['Баунти', 'Баунти'], perita: ['Восстание Периты', 'Еженедельно'], recall: ['Отзыв: Десять-Ноль', 'Еженедельно'], railjack: ['Проксима: {p}', 'Рейлджек'],
    },
  };
  const hubOf = (n) => {
    if (n.t === 'Skirmish') return n.p === 'Veil Proxima' ? null : 'railjack';
    if (n.t === 'The Perita Rebellion') return 'perita';
    if (n.t === 'Recall') return 'recall';
    if (n.t !== 'Bounty') return null;
    if (/Cetus|Ghoul|Plague Star/i.test(n.n)) return 'cetus';
    if (/Orb Vallis|PROFIT-TAKER/i.test(n.n)) return 'fortuna';
    if (/Cambion|Isolation Vault/i.test(n.n)) return 'necralisk';
    if (/Entrati Lab/i.test(n.n)) return 'sanctum';
    if (/Zariman/i.test(n.n)) return 'chrysalith';
    if (/WF1999/i.test(n.n)) return 'hex';
    return 'bounty';
  };
  const prepNodes = (nodes) => {
    const byKey = new Map(nodes.map((n) => [n.p + '|' + n.n, n]));
    const out = [];
    for (const n of nodes) {
      const m = n.n.match(/^(.*) \(Extra\)$/);
      const base = m && byKey.get(n.p + '|' + m[1]);
      if (base) { for (const [rot, d] of Object.entries(n.r)) base.r[rot ? 'Extra ' + rot : 'Extra'] = d; continue; }
      out.push(n);
    }
    out.forEach((n) => {
      n.key = n.p + '|' + n.n;
      n.hub = hubOf(n);
      n.hk = n.hub ? 'hub:' + n.p + '|' + n.hub : null;
      const lv = n.n.match(/^Level\s+(\d+)\s*-\s*(\d+)\s+(.*)$/);
      n.lv = lv ? +lv[1] : 0;
      n.lvl = lv ? lv[1] + '–' + lv[2] : '';
      n.short = lv ? lv[3] : n.n;
    });
    return out;
  };

  const KIND_ORDER = ['relic', 'frame', 'gear', 'resource', 'currency', 'other'];
  const KIND_COLOR = { relic: '#e3b45e', frame: '#e9eef2', gear: '#c9b48a', resource: '#7fd0e6', currency: '#8a9aa6', other: '#a99bd6', prime: '#e3b45e' };

  const safe = (fn, d) => { try { return fn(); } catch (e) { return d; } };
  const lsGet = (k) => safe(() => localStorage.getItem(k), null);
  const lsSet = (k, v) => safe(() => localStorage.setItem(k, v));
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const relicBase = (n) => n.replace(/ Relic.*$/, '');
  const round = (n) => Math.round(n * 100) / 100;

  document.addEventListener('alpine:init', () => {
    window.Alpine.store('wf', {
      loaded: false, error: '', toast: '',
      lang: lsGet('wf_lang') === 'ru' ? 'ru' : 'en',
      A: { items: [], nodes: [], planets: {}, cdn: '' }, P: { items: [], relics: [] }, RU: {},
      generatedAt: null, loadedAt: 0,
      tab: 'prime', filter: '', open: {},
      sel: safe(() => JSON.parse(lsGet('wf_atlas_sel')) || {}, {}),
      q: '', focus: null,
      view: null,
      pinned: null,
      hub: null, hubMap: new Map(),
      tip: { show: false, x: 0, y: 0, html: '' },

      planHits: new Map(), planPlanets: {}, ranking: [], findHits: new Map(), findPlanets: {}, panel: null, aboutOpen: false,
      mode: lsGet('wf_mode') === 'late' ? 'late' : 'base',

      async load(silent) {
        try {
          const get = (u) => fetch(u + '?t=' + Date.now(), { cache: 'no-store' }).then((r) => { if (!r.ok) throw new Error(u + ' HTTP ' + r.status); return r.json(); });
          const [A, P, RU] = await Promise.all([get('data/atlas.json'), get('data/primes.json'), get('data/ru.json').catch(() => ({}))]);
          const changed = this.generatedAt && this.generatedAt !== A.generatedAt;
          A.nodes = prepNodes(A.nodes);
          this.A = A; this.P = P; this.RU = RU; this.generatedAt = A.generatedAt; this.loadedAt = Date.now();
          this.nodeByKey = new Map(A.nodes.map((n) => [n.key, n]));
          this.hubMap = this.buildHubs(A.nodes);
          if (this.hub && !this.hubMap.has(this.hub)) this.hub = null;
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

      refreshIfStale() { if (this.loaded && Date.now() - this.loadedAt > 30 * 60 * 1000) this.load(true); },
      flash(msg) { this.toast = msg; setTimeout(() => { this.toast = ''; }, 3500); },

      t(k) { const d = I18N[this.lang]; return d[k] != null ? d[k] : I18N.en[k] != null ? I18N.en[k] : k; },
      kindName(k) { return (I18N[this.lang].kind || {})[k] || k; },
      planetName(p) { return this.lang === 'ru' ? (PLANET_RU[p] || p) : p; },
      typeName(t) { return !t ? '' : this.lang === 'ru' ? (TYPE_RU[t] || t) : t; },
      toggleLang() { this.lang = this.lang === 'en' ? 'ru' : 'en'; lsSet('wf_lang', this.lang); this.emit(); },
      tierName(t) { return this.lang === 'ru' ? ({ Lith: 'Лит', Meso: 'Мезо', Neo: 'Нео', Axi: 'Акси', Requiem: 'Реквием' }[t] || t) : t; },
      nm(n) { return (this.lang === 'ru' && n && this.RU[n]) || n; },
      matches(n, q) { return n.toLowerCase().includes(q) || (!!this.RU[n] && this.RU[n].toLowerCase().includes(q)); },
      partShort(owner, p) {
        if (this.lang !== 'ru' || !this.RU[p.name]) return p.short;
        const o = this.RU[owner] || owner;
        let rest = this.RU[p.name];
        if (rest.startsWith(o)) rest = rest.slice(o.length);
        rest = rest.replace(/^\((.+?)\):\s*/, '$1: ').replace(/^[:\s]+/, '').replace(/\s*\(Чертеж\)$/, '');
        return rest || 'Чертеж';
      },
      noImg(ev) { ev.target.onerror = null; ev.target.src = 'media/lotus.png'; ev.target.classList.add('no-img'); },
      toggleMode() { this.mode = this.mode === 'late' ? 'base' : 'late'; lsSet('wf_mode', this.mode); this.emit(); },
      emit() { window.dispatchEvent(new CustomEvent('atlas:update')); },

      img(name) { return name ? this.A.cdn + encodeURIComponent(name) : ''; },
      itemImg(it) {
        if (it.kind === 'relic') return this.img('Relic' + it.name.split(' ')[0] + 'D.png');
        return it.img ? this.img(it.img) : '';
      },
      fmt(n) { return n == null ? '' : (Math.round(n * 100) / 100) + '%'; },
      kindColor(k) { return KIND_COLOR[k] || '#a3938b'; },
      dateStr() { return this.generatedAt ? new Date(this.generatedAt).toLocaleDateString(this.lang === 'ru' ? 'ru-RU' : 'en-GB') : ''; },

      buildHubs(nodes) {
        const map = new Map();
        nodes.forEach((n) => {
          if (!n.hk) return;
          const h = map.get(n.hk) || { key: n.hk, id: n.hub, p: n.p, nodes: [] };
          h.nodes.push(n);
          map.set(n.hk, h);
        });
        map.forEach((h) => h.nodes.sort((a, b) => a.lv - b.lv || a.short.localeCompare(b.short)));
        return map;
      },
      hubsOf(p) { return [...this.hubMap.values()].filter((h) => h.p === p).sort((a, b) => HUB_ORDER.indexOf(a.id) - HUB_ORDER.indexOf(b.id)); },
      hubName(h) { return (HUB_TEXT[this.lang][h.id] || [h.id])[0].replace('{p}', this.lang === 'ru' ? this.planetName(h.p) : h.p); },
      hubSub(h) { return (HUB_TEXT[this.lang][h.id] || ['', ''])[1]; },
      hubHit(h) {
        let plan = 0, find = 0;
        h.nodes.forEach((n) => {
          const ph = this.planHits.get(n.key), fh = this.findHits.get(n.key);
          if (ph) plan = Math.max(plan, ph.eff);
          if (fh) find = Math.max(find, fh.eff);
        });
        return { plan, find };
      },
      nodeLabel(n) { if (!n.hk) return n.n; const h = this.hubMap.get(n.hk); return (h ? this.hubName(h) + ' · ' : '') + (n.lvl ? n.lvl + ' ' : '') + n.short; },
      pinnedHub() { return this.hub ? this.hubMap.get(this.hub) || null : null; },
      openHub(key) {
        this.hub = key; this.pinned = null; this.hideTip();
        if (window.innerWidth < 1024) this.panel = 'right';
        this.emit();
      },
      closeHub() { this.hub = null; this.pinned = null; this.emit(); },
      rotName(rot) {
        if (!rot) return '';
        const m = rot.match(/^Extra ?(.*)$/);
        if (!m) return this.t('rot') + ' ' + rot;
        return this.t('bonus') + (m[1] ? ' · ' + this.t('rot') + ' ' + m[1] : '');
      },
      hubTip(h) {
        const hit = this.hubHit(h);
        let s = `<div class="tip-h">${esc(this.hubName(h))}<span>${esc(this.hubSub(h))}</span></div>`;
        if (hit.plan) s += `<div class="tip-hit">● ${esc(this.t('your'))}: ${this.fmt(hit.plan)}</div>`;
        if (hit.find) s += `<div class="tip-find">● ${esc(this.nm(this.focus))}: ${this.fmt(hit.find)}</div>`;
        for (const n of h.nodes.slice(0, 14)) {
          const ph = this.planHits.get(n.key), fh = this.findHits.get(n.key);
          s += `<div class="tip-row${ph || fh ? ' want' : ''}"><i style="background:${ph ? '#e3b45e' : fh ? '#7fd0e6' : '#5d6f7b'}"></i><b>${n.lvl ? esc(n.lvl) + ' · ' : ''}${esc(n.short)}</b><em>${ph ? this.fmt(ph.eff) : fh ? this.fmt(fh.eff) : ''}</em></div>`;
        }
        if (h.nodes.length > 14) s += `<div class="tip-more">+${h.nodes.length - 14} ${esc(this.t('more'))}</div>`;
        s += `<div class="tip-foot">${esc(this.t('click_hint_hub'))}</div>`;
        return s;
      },

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
        return q ? list.filter((i) => this.matches(i.name, q) || i.parts.some((p) => this.matches(p.name, q))) : list;
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

      recalc() {

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
        this.emit();
      },
      byPlanet(hits) {
        const out = {};
        for (const h of hits.values()) {
          const p = out[h.node.p] || (out[h.node.p] = { count: 0, best: 0 });
          p.count++; p.best = Math.max(p.best, h.eff);
        }
        return out;
      },

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
        const res = this.searchIndex().filter((e) => this.matches(e.name, q));
        const starts = (e) => (e.name.toLowerCase().startsWith(q) || this.nm(e.name).toLowerCase().startsWith(q) ? 0 : 1);
        res.sort((a, b) => starts(a) - starts(b)
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
        this.emit();
      },
      focusList() { return [...this.findHits.values()].sort((a, b) => b.eff - a.eff).slice(0, 60); },
      focusResPlanets() { return Object.keys(this.findPlanets); },

      openPlanet(p, nodeKey) {
        this.view = p; this.hideTip();
        this.hub = null; this.pinned = null;
        if (nodeKey) { this.pinned = nodeKey; this.hub = (this.nodeByKey.get(nodeKey) || {}).hk || null; if (window.innerWidth < 1024) this.panel = 'right'; }
        else if (window.innerWidth < 1024) this.panel = null;
        window.dispatchEvent(new CustomEvent('atlas:fly', { detail: { planet: p, node: nodeKey || null } }));
      },
      pin(key) {
        this.pinned = key; this.hub = (this.nodeByKey.get(key) || {}).hk || null; this.hideTip();
        if (window.innerWidth < 1024) this.panel = 'right';
        this.emit();
      },
      closePlanet() {
        this.view = null; this.pinned = null; this.hub = null; this.hideTip();
        window.dispatchEvent(new CustomEvent('atlas:fly', { detail: { planet: null } }));
      },
      togglePanel(p) { this.panel = this.panel === p ? null : p; },
      planetNodes() {
        if (!this.view) return [];
        const nodes = this.A.nodes.filter((n) => n.p === this.view);
        const score = (n) => (this.planHits.get(n.key) ? 2 : 0) + (this.findHits.get(n.key) ? 1 : 0);
        return nodes.sort((a, b) => score(b) - score(a) || (a.t || '').localeCompare(b.t || '') || a.n.localeCompare(b.n));
      },
      planetLoot(p) {
        const frames = new Map(); const gear = new Map(); const relics = new Map();
        const keep = (map, key, extra, part, n, rot, ch) => {
          const g = map.get(key) || { name: key, parts: new Map(), ...extra };
          const prev = g.parts.get(part.name);
          if (!prev || ch > prev.ch) g.parts.set(part.name, { it: part, node: n, rot, ch });
          map.set(key, g);
        };
        for (const n of this.A.nodes) {
          if (n.p !== p) continue;
          for (const [rot, drops] of Object.entries(n.r)) for (const [i, ch] of drops) {
            const it = this.A.items[i];
            if (it.kind === 'frame') keep(frames, it.owner, { img: it.img }, it, n, rot, ch);
            else if (it.kind === 'gear' && it.owner) keep(gear, it.owner, { img: it.img }, it, n, rot, ch);
            else if (it.kind === 'relic') keep(relics, it.name.split(' ')[0], {}, it, n, rot, ch);
          }
        }
        const order = ['Blueprint', 'Neuroptics', 'Chassis', 'Systems'];
        const rank = (g, x) => { const s = x.it.name.slice(g.name.length).trim(); const k = order.findIndex((w) => s.startsWith(w) || s.endsWith(w + ' Blueprint')); return k < 0 ? 9 : k; };
        const fin = (map) => [...map.values()].map((g) => {
          const parts = [...g.parts.values()].sort((a, b) => rank(g, a) - rank(g, b) || a.it.name.localeCompare(b.it.name));
          const fr = this.frames && this.frames.find((f) => f.name === g.name);
          return { ...g, parts, total: fr ? fr.parts.length : parts.length, set: fr || null };
        }).sort((a, b) => (b.parts.length >= b.total) - (a.parts.length >= a.total) || a.name.localeCompare(b.name));
        const tiers = ['Lith', 'Meso', 'Neo', 'Axi', 'Requiem'];
        return {
          frames: fin(frames),
          gear: fin(gear),
          relics: [...relics.values()].sort((a, b) => tiers.indexOf(a.name) - tiers.indexOf(b.name)).map((g) => ({ tier: g.name, list: [...g.parts.values()].sort((a, b) => a.it.name.localeCompare(b.it.name)) })),
        };
      },
      loot: null, lootFor: null, lootOpen: {},
      viewLoot() {
        if (!this.view) return null;
        if (this.lootFor !== this.view + this.generatedAt) { this.loot = this.planetLoot(this.view); this.lootFor = this.view + this.generatedAt; }
        return this.loot;
      },
      partLabel(owner, x) { return this.partShort(owner, { name: x.it.name, short: x.it.name.slice(owner.length).trim().replace(/ Blueprint$/, '') || 'Blueprint' }); },
      planFrame(g) {
        if (!g.set) return;
        this.toggleSet({ ...g.set, pre: 'a:' });
        this.tab = 'frames';
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

      showTip(ev, html) { this.tip = { show: true, html, ...this.tipPos(ev) }; },
      moveTip(ev) { if (this.tip.show) Object.assign(this.tip, this.tipPos(ev)); },
      hideTip() { this.tip.show = false; },
      tipPos(ev) {
        const w = 340, h = 380, pad = 16;
        let x = ev.clientX + pad, y = ev.clientY + pad;
        if (x + w > window.innerWidth) x = Math.max(8, ev.clientX - w - pad);
        const panel = window.innerWidth >= 1024 && ev.target && ev.target.closest ? ev.target.closest('.wf-panel') : null;
        if (panel) { const r = panel.getBoundingClientRect(); x = r.left > window.innerWidth / 2 ? r.left - w - 10 : r.right + 10; }
        if (y + h > window.innerHeight) y = Math.max(8, window.innerHeight - h - 8);
        return { x, y };
      },
      planetTip(p) {
        const info = this.planetInfo(p);
        const plan = this.planPlanets[p]; const find = this.findHits.size ? [...this.findHits.values()].filter((h) => h.node.p === p) : [];
        let h = `<div class="tip-h">${esc(this.planetName(p))}<span>${info.nodes} ${esc(this.t('nodes'))}</span></div>`;
        if (plan) h += `<div class="tip-hit">● ${esc(this.t('your'))}: ${plan.count} · ${this.fmt(plan.best)}</div>`;
        if (find.length || this.findPlanets[p]) h += `<div class="tip-find">● ${esc(this.nm(this.focus))}${find.length ? ': ' + find.length + ' · ' + this.fmt(Math.max(...find.map((f) => f.eff))) : ''}</div>`;
        if (info.res.length) {
          h += `<div class="tip-s">${esc(this.t('resources'))}</div><div class="tip-res">`;
          for (const [r, img] of info.res) h += `<span>${img ? `<img src="${this.img(img)}" alt="" onerror="this.remove()">` : ''}${esc(this.nm(r))}</span>`;
          h += '</div>';
        }
        if (info.frames.length) h += `<div class="tip-s">${esc(this.t('bosses'))}</div><div class="tip-t">${info.frames.map((f) => esc(this.nm(f))).join(', ')}</div>`;
        if (info.tiers.length) h += `<div class="tip-s">${esc(this.t('relics'))}</div><div class="tip-t">${info.tiers.join(' · ')}</div>`;
        h += `<div class="tip-foot">${esc(this.t('click_hint'))}</div>`;
        return h;
      },
      nodeTip(nd) {
        let h = `<div class="tip-h">${esc(nd.n)}<span>${esc(this.typeName(nd.t))}</span></div>`;
        for (const g of this.nodeGroups(nd, 9)) {
          if (g.rot) h += `<div class="tip-s">${esc(this.rotName(g.rot))}</div>`;
          for (const r of g.rows) {
            const want = this.isWanted(nd, r.it);
            h += `<div class="tip-row${want ? ' want' : ''}"><i style="background:${this.kindColor(r.it.kind)}"></i><b>${r.qty ? esc(r.qty) + ' ' : ''}${esc(this.nm(r.it.name))}</b><em>${this.fmt(r.ch)}</em></div>`;
          }
          if (g.hidden) h += `<div class="tip-more">+${g.hidden} ${esc(this.t('more'))}</div>`;
        }
        return h;
      },

      pinnedNode() { return this.pinned ? this.nodeByKey.get(this.pinned) : null; },
      planetHit(p) { return { plan: this.planPlanets[p] || null, find: !!this.findPlanets[p] || [...this.findHits.values()].some((h) => h.node.p === p) }; },
      anyHi() { return !!(this.planHits.size || this.findHits.size || Object.keys(this.findPlanets).length); },
      nodesOf(p) { const key = (n) => (/^Endless/.test(n.n) ? '1' : '0') + n.n.replace('Repeated Rewards', 'Tier 99'); return this.A.nodes.filter((n) => n.p === p).sort((a, b) => key(a).localeCompare(key(b), 'en', { numeric: true })); },
      nodeSub(n) { const ph = this.planHits.get(n.key), fh = this.findHits.get(n.key); return [this.typeName(n.t), ph ? this.fmt(ph.eff) : fh ? this.fmt(fh.eff) : ''].filter(Boolean).join(' · '); },
    });

    const s = window.Alpine.store('wf');
    s.load();
    document.addEventListener('visibilitychange', () => { if (!document.hidden) s.refreshIfStale(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') { if (s.pinned) { s.pinned = null; s.emit(); } else if (s.hub) s.closeHub(); else if (s.view) s.closePlanet(); } });
  });
})();
