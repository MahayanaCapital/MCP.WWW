/* Mahayana Markets Brief — renders the daily edition from /api/brief */
(() => {
  const root = document.querySelector('.mb');
  if (!root) return;
  const lang = root.dataset.lang === 'zh' ? 'zh' : 'en';
  const ZH = lang === 'zh';

  const T = ZH ? {
    vol: 'VOL. I', no: '第', noSuffix: ' 期', updated: '更新於', hkt: '香港 / 上海時間',
    glance: '今日速覽', wire: '要聞', lead: '今日導讀 · 市場綜述', by: 'Mahayana 市場研究台 · 自動生成',
    americas: '美洲', europe: '歐洲', asia: '亞太', rates: '利率與波動', fx: '外匯', commodities: '大宗商品', crypto: '數字資產',
    name: '名稱', last: '最新', chg: '漲跌', m1: '一個月',
    leaders: '領漲', laggards: '領跌', spxTitle: '標普 500 · 過去一年', spxCap: '週線收盤；資料可能延遲。',
    error: '即時市場資料暫時無法取得，請稍後重新整理。', loading: '載入中…', noNews: '暫無新聞。',
    weekdays: ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'],
  } : {
    vol: 'VOL. I', no: 'NO. ', noSuffix: '', updated: 'Updated', hkt: 'Hong Kong / Shanghai time',
    glance: 'At a Glance', wire: 'The Wire', lead: "Today's Lead · Market Wrap", by: 'Mahayana Markets Desk · Automated edition',
    americas: 'Americas', europe: 'Europe', asia: 'Asia Pacific', rates: 'Rates & Volatility', fx: 'Currencies', commodities: 'Commodities', crypto: 'Digital Assets',
    name: 'Market', last: 'Last', chg: 'Chg', m1: '1M',
    leaders: 'Leaders', laggards: 'Laggards', spxTitle: 'S&P 500 · Past Year', spxCap: 'Weekly closes; prices may be delayed.',
    error: 'Live market data is temporarily unavailable. Please refresh in a few minutes.', loading: 'Loading…', noNews: 'No headlines available.',
    weekdays: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  };

  const $ = (s) => root.querySelector(s);
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const cls = (v) => (v > 0.005 ? 'up' : v < -0.005 ? 'down' : 'flat');
  const sign = (v) => (v > 0 ? '+' : v < 0 ? '−' : '');
  const pct = (v, d = 2) => `${sign(v)}${Math.abs(v).toFixed(d)}%`;

  function digits(q) {
    if (q.kind === 'fx') return q.price > 20 ? 2 : 4;
    if (q.kind === 'crypto') return q.price > 1000 ? 0 : 2;
    return 2;
  }
  function fmt(q) {
    const s = q.price.toLocaleString('en-US', { minimumFractionDigits: digits(q), maximumFractionDigits: digits(q) });
    return q.kind === 'yield' ? `${s}%` : s;
  }
  function chgCell(q) {
    if (q.kind === 'yield') {
      const bp = q.change * 100;
      return `<span class="${cls(bp)}">${sign(bp)}${Math.abs(bp).toFixed(1)}${ZH ? ' 基點' : 'bp'}</span>`;
    }
    return `<span class="${cls(q.pct)}">${pct(q.pct)}</span>`;
  }

  function sparkSvg(values, up) {
    if (!values || values.length < 2) return '';
    const min = Math.min(...values), max = Math.max(...values), w = 70, h = 22;
    const pts = values.map((v, i) => `${((i / (values.length - 1)) * w).toFixed(1)},${(h - 2 - ((v - min) / (max - min || 1)) * (h - 4)).toFixed(1)}`).join(' ');
    return `<svg viewBox="0 0 ${w} ${h}" aria-hidden="true"><polyline fill="none" stroke="currentColor" stroke-width="1.3" points="${pts}"/></svg>`;
  }

  function table(title, rows) {
    if (!rows.length) return '';
    const body = rows.map((q) => `<tr><td>${esc(q.name)}</td><td>${fmt(q)}</td><td>${chgCell(q)}</td><td class="spark ${cls(q.monthPct)}">${sparkSvg(q.spark)}</td></tr>`).join('');
    return `<div class="mb-table"><h3>${title}</h3><table><thead><tr><th>${T.name}</th><th>${T.last}</th><th>${T.chg}</th><th>${T.m1}</th></tr></thead><tbody>${body}</tbody></table></div>`;
  }

  /* ---------- Automated market wrap ---------- */
  function wrap(Q) {
    const g = (s) => Q[s];
    const spx = g('^GSPC'), ndx = g('^IXIC'), sx5e = g('^STOXX50E'), tnx = g('^TNX'), dxy = g('DX-Y.NYB');
    const gold = g('GC=F'), brent = g('BZ=F'), copper = g('HG=F'), btc = g('BTC-USD'), vix = g('^VIX'), jpy = g('USDJPY=X'), cnh = g('CNY=X');
    const asia = ['^N225', '^HSI', '000001.SS', '^KS11', '^TWII', '^NSEI', '^AXJO'].map(g).filter(Boolean);
    const asiaAvg = asia.length ? asia.reduce((a, q) => a + q.pct, 0) / asia.length : 0;
    const asiaBest = asia.slice().sort((a, b) => b.pct - a.pct)[0];
    const asiaWorst = asia.slice().sort((a, b) => a.pct - b.pct)[0];
    const us = spx ? spx.pct : 0;

    const usVerbEN = us > 1 ? 'Rallies' : us > 0.25 ? 'Climbs' : us < -1 ? 'Slides' : us < -0.25 ? 'Slips' : 'Holds Steady';
    const usVerbZH = us > 1 ? '美股大漲' : us > 0.25 ? '美股走高' : us < -1 ? '美股重挫' : us < -0.25 ? '美股走低' : '美股持穩';
    const mv = (q) => (q ? Math.abs(q.pct) : 0);
    const cands = [
      brent && { k: 'oil', s: mv(brent) / 1.6, v: brent.pct },
      gold && { k: 'gold', s: mv(gold) / 0.9, v: gold.pct },
      dxy && { k: 'dollar', s: mv(dxy) / 0.35, v: dxy.pct },
      tnx && { k: 'yields', s: Math.abs(tnx.change * 100) / 5, v: tnx.change * 100 },
      btc && { k: 'btc', s: mv(btc) / 2.8, v: btc.pct },
      asia.length && { k: 'asia', s: Math.abs(asiaAvg) / 0.9, v: asiaAvg },
      ndx && spx && { k: 'tech', s: Math.abs(ndx.pct - spx.pct) / 0.5, v: ndx.pct - spx.pct },
    ].filter(Boolean).sort((a, b) => b.s - a.s);
    const top = cands[0];
    const up = top && top.v > 0;
    const clauseEN = top ? {
      oil: `Oil ${up ? 'Jumps' : 'Falls'} ${pct(Math.abs(top.v), 1).replace('+', '')}`,
      gold: `Gold ${up ? 'Shines' : 'Loses Luster'}`,
      dollar: `Dollar ${up ? 'Strengthens' : 'Weakens'}`,
      yields: `Treasury Yields ${up ? 'Rise' : 'Fall'}`,
      btc: `Bitcoin ${up ? 'Surges' : 'Tumbles'}`,
      asia: `Asia ${up ? 'Gains' : 'Retreats'}`,
      tech: `Tech ${up ? 'Leads' : 'Lags'}`,
    }[top.k] : '';
    const clauseZH = top ? {
      oil: `油價${up ? '大漲' : '下挫'} ${Math.abs(top.v).toFixed(1)}%`,
      gold: `金價${up ? '走強' : '回落'}`,
      dollar: `美元${up ? '走強' : '走弱'}`,
      yields: `美債殖利率${up ? '上行' : '下行'}`,
      btc: `比特幣${up ? '急漲' : '急跌'}`,
      asia: `亞股${up ? '普漲' : '回落'}`,
      tech: `科技股${up ? '領漲' : '落後'}`,
    }[top.k] : '';

    const headline = ZH ? `${usVerbZH}，${clauseZH}` : `Wall Street ${usVerbEN} as ${clauseEN}`;

    const dirEN = (v, a = 'rose', b = 'fell', c = 'was little changed') => (v > 0.05 ? a : v < -0.05 ? b : c);
    const dirZH = (v, a = '上漲', b = '下跌', c = '大致持平') => (v > 0.05 ? a : v < -0.05 ? b : c);
    const abs = (v) => `${Math.abs(v).toFixed(2)}%`;

    let dek, paras = [];
    if (ZH) {
      dek = `標普 500 ${spx ? dirZH(spx.pct) + ' ' + abs(spx.pct) : '—'}，歐洲斯托克 50 ${sx5e ? dirZH(sx5e.pct) + ' ' + abs(sx5e.pct) : '—'}，亞太市場平均${dirZH(asiaAvg)}${Math.abs(asiaAvg) > 0.05 ? ' ' + abs(asiaAvg) : ''}。`;
      if (spx) paras.push(`美國股市方面，標普 500 指數${dirZH(spx.pct)} ${abs(spx.pct)}，收於 ${fmt(spx)} 點${ndx ? `；納斯達克綜合指數${dirZH(ndx.pct)} ${abs(ndx.pct)}` : ''}。歐洲市場${sx5e ? `，歐洲斯托克 50 指數${dirZH(sx5e.pct)} ${abs(sx5e.pct)}` : '表現平穩'}。${asiaBest && asiaWorst ? `亞太區表現最好的是${asiaBest.name}（${pct(asiaBest.pct)}），最弱的是${asiaWorst.name}（${pct(asiaWorst.pct)}）。` : ''}`);
      if (tnx || dxy) paras.push(`${tnx ? `美國 10 年期公債殖利率報 ${fmt(tnx)}，${tnx.change >= 0 ? '上升' : '下降'} ${Math.abs(tnx.change * 100).toFixed(1)} 個基點。` : ''}${dxy ? `美元指數${dirZH(dxy.pct)}至 ${fmt(dxy)}。` : ''}${jpy ? `美元兌日圓報 ${fmt(jpy)}${cnh ? '，' : '。'}` : ''}${cnh ? `美元兌人民幣報 ${fmt(cnh)}。` : ''}`);
      if (gold || brent) paras.push(`大宗商品方面，${gold ? `黃金${dirZH(gold.pct)} ${abs(gold.pct)}，報每盎司 ${fmt(gold)} 美元；` : ''}${brent ? `布蘭特原油${dirZH(brent.pct)} ${abs(brent.pct)}，報每桶 ${fmt(brent)} 美元；` : ''}${copper ? `銅價${dirZH(copper.pct)} ${abs(copper.pct)}。` : ''}${btc ? `數字資產方面，比特幣${dirZH(btc.pct)} ${abs(btc.pct)}，報 ${fmt(btc)} 美元。` : ''}`);
    } else {
      dek = `The S&P 500 ${spx ? dirEN(spx.pct) + ' ' + abs(spx.pct) : 'was unavailable'}, Europe's Euro Stoxx 50 ${sx5e ? dirEN(sx5e.pct) + ' ' + abs(sx5e.pct) : 'was quiet'}, and Asia-Pacific markets ${dirEN(asiaAvg, 'advanced', 'declined', 'were mixed')} on average.`;
      if (spx) paras.push(`In New York, the S&P 500 ${dirEN(spx.pct)} ${abs(spx.pct)} to ${fmt(spx)}${ndx ? `, while the Nasdaq Composite ${dirEN(ndx.pct)} ${abs(ndx.pct)}` : ''}. ${sx5e ? `European equities ${dirEN(sx5e.pct, 'gained', 'lost', 'were flat')}, with the Euro Stoxx 50 moving ${pct(sx5e.pct)}.` : ''} ${asiaBest && asiaWorst ? `In Asia, ${asiaBest.name} led the region at ${pct(asiaBest.pct)}, while ${asiaWorst.name} trailed at ${pct(asiaWorst.pct)}.` : ''}`);
      if (tnx || dxy) paras.push(`${tnx ? `The 10-year Treasury yield stood at ${fmt(tnx)}, ${tnx.change >= 0 ? 'up' : 'down'} ${Math.abs(tnx.change * 100).toFixed(1)} basis points. ` : ''}${dxy ? `The dollar index ${dirEN(dxy.pct)} to ${fmt(dxy)}. ` : ''}${jpy ? `The yen traded at ${fmt(jpy)} per dollar` : ''}${cnh ? `${jpy ? ', and' : ''} the yuan at ${fmt(cnh)}.` : jpy ? '.' : ''}`);
      if (gold || brent) paras.push(`In commodities, ${gold ? `gold ${dirEN(gold.pct)} ${abs(gold.pct)} to $${fmt(gold)} an ounce` : ''}${brent ? `${gold ? ' and ' : ''}Brent crude ${dirEN(brent.pct)} ${abs(brent.pct)} to $${fmt(brent)} a barrel` : ''}.${copper ? ` Copper ${dirEN(copper.pct)} ${abs(copper.pct)}.` : ''}${btc ? ` Among digital assets, bitcoin ${dirEN(btc.pct)} ${abs(btc.pct)} to $${fmt(btc)}.` : ''}`);
    }
    const all = Object.values(Q).filter((q) => q.kind !== 'yield' && q.symbol !== '^VIX');
    const best = all.slice().sort((a, b) => b.monthPct - a.monthPct)[0];
    const worst = all.slice().sort((a, b) => a.monthPct - b.monthPct)[0];
    if (best && worst) {
      const mood = vix ? (vix.price < 15 ? (ZH ? '市場情緒平靜' : 'calm') : vix.price < 25 ? (ZH ? '波動處於正常區間' : 'moderate') : (ZH ? '避險情緒升溫' : 'elevated')) : '';
      paras.push(ZH
        ? `拉長到一個月來看，${best.name}表現最佳（${pct(best.monthPct)}），${worst.name}表現最弱（${pct(worst.monthPct)}）。${vix ? `VIX 波動率指數報 ${fmt(vix)}，${mood}。` : ''}`
        : `Over the past month, ${best.name} has been the strongest performer we track (${pct(best.monthPct)}), while ${worst.name} has been the weakest (${pct(worst.monthPct)}).${vix ? ` The VIX sits at ${fmt(vix)}, signaling ${mood} volatility.` : ''}`);
    }
    return { headline, dek, paras };
  }

  /* ---------- Render ---------- */
  function renderMasthead(ed) {
    const d = new Date(`${ed.date}T12:00:00+08:00`);
    const dateStr = ZH
      ? `${d.getUTCFullYear()} 年 ${d.getUTCMonth() + 1} 月 ${d.getUTCDate()} 日 · ${T.weekdays[d.getUTCDay()]}`
      : `${T.weekdays[d.getUTCDay()]}, ${d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })}`;
    $('[data-mb="issue"]').textContent = `${T.vol} · ${T.no}${ed.issue}${T.noSuffix}`;
    $('[data-mb="date"]').textContent = dateStr;
    $('[data-mb="updated"]').textContent = `${T.updated} ${ed.time} · ${T.hkt}`;
  }

  function render(data) {
    const quotes = data.quotes || [];
    const Q = Object.fromEntries(quotes.map((q) => [q.symbol, q]));
    renderMasthead(data.edition);

    // Ticker (duplicated for seamless loop)
    const tick = quotes.map((q) => `<span class="mb-ticker-item"><b>${esc(q.name)}</b>${fmt(q)}${chgCell(q).replace('<span', '<span')}</span>`).join('');
    $('[data-mb="ticker"]').innerHTML = tick + tick;

    // At a glance
    const glanceSyms = ['^GSPC', '^IXIC', '^STOXX50E', '^N225', '^HSI', '000001.SS', '^TNX', 'DX-Y.NYB', 'CNY=X', 'GC=F', 'BZ=F', 'BTC-USD'];
    $('[data-mb="glance"]').innerHTML = glanceSyms.map((s) => Q[s]).filter(Boolean)
      .map((q) => `<li><span class="n">${esc(q.name)}</span><span class="p">${fmt(q)}</span><span class="c">${chgCell(q)}</span></li>`).join('');

    // Lead
    const w = wrap(Q);
    $('[data-mb="headline"]').textContent = w.headline;
    $('[data-mb="dek"]').textContent = w.dek;
    $('[data-mb="body"]').innerHTML = w.paras.map((p) => `<p>${esc(p.replace(/\s+/g, ' ').trim())}</p>`).join('');

    // Feature chart
    const spx = Q['^GSPC'];
    if (spx) $('[data-mb="spx-now"]').innerHTML = `${fmt(spx)} ${chgCell(spx)}`;
    const feat = data.feature || [];
    if (window.Chart && feat.length) {
      const first = feat[0][1], last = feat[feat.length - 1][1];
      const color = getComputedStyle(root).getPropertyValue(last >= first ? '--mb-up' : '--mb-down').trim() || '#13744a';
      new Chart($('#mbSpx'), {
        type: 'line',
        data: { labels: feat.map((p) => new Date(p[0] * 1000).toLocaleDateString(ZH ? 'zh-TW' : 'en-GB', { month: 'short', year: '2-digit' })), datasets: [{ data: feat.map((p) => p[1]), borderColor: color, backgroundColor: color + '18', fill: true, borderWidth: 1.8, pointRadius: 0, tension: .2 }] },
        options: {
          responsive: true, maintainAspectRatio: false, animation: false,
          plugins: { legend: { display: false }, tooltip: { intersect: false, mode: 'index', callbacks: { label: (c) => c.parsed.y.toLocaleString('en-US') } } },
          scales: {
            x: { grid: { display: false }, ticks: { maxTicksLimit: 6, color: '#6c605a', font: { size: 10, family: 'DM Sans' } }, border: { color: '#17110f' } },
            y: { position: 'right', grid: { color: 'rgba(23,17,15,.08)' }, border: { display: false }, ticks: { maxTicksLimit: 5, color: '#6c605a', font: { size: 10, family: 'DM Sans' } } },
          },
        },
      });
    }

    // News
    const news = data.news || [];
    const newsItem = (n) => `<a href="${esc(n.link)}" target="_blank" rel="noopener">${esc(n.title)}</a><small>${esc(n.source)}${n.time ? ' · ' + new Date(n.time * 1000).toLocaleString(ZH ? 'zh-TW' : 'en-GB', { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short', timeZone: 'Asia/Shanghai' }) : ''}</small>`;
    $('[data-mb="wire"]').innerHTML = news.slice(0, 7).map((n) => `<li>${newsItem(n)}</li>`).join('') || `<li>${T.noNews}</li>`;
    $('[data-mb="more"]').innerHTML = news.slice(7, 19).map((n) => `<article>${newsItem(n)}</article>`).join('');
    if (news.length <= 7) $('[data-mb="more-section"]').hidden = true;

    // Regional tables
    const by = (grp) => quotes.filter((q) => q.group === grp);
    $('[data-mb="regions"]').innerHTML = table(T.americas, by('americas')) + table(T.europe, by('europe')) + table(T.asia, by('asia'));
    $('[data-mb="cross"]').innerHTML = table(T.rates, by('rates')) + table(T.fx, by('fx')) + table(T.commodities, by('commodities')) + table(T.crypto, by('crypto'));

    // Movers (exclude yields, fx with tiny moves still fine)
    const movable = quotes.filter((q) => q.kind !== 'yield' && q.symbol !== '^VIX');
    const sorted = movable.slice().sort((a, b) => b.pct - a.pct);
    const maxAbs = Math.max(...movable.map((q) => Math.abs(q.pct)), 0.01);
    const bar = (q) => `<div class="mb-bar ${cls(q.pct)}"><span style="color:var(--mb-ink)">${esc(q.name)}</span><i style="width:${Math.max(3, (Math.abs(q.pct) / maxAbs) * 100).toFixed(1)}%"></i><span>${pct(q.pct)}</span></div>`;
    $('[data-mb="leaders"]').innerHTML = `<h3>${T.leaders}</h3>` + sorted.slice(0, 6).map(bar).join('');
    $('[data-mb="laggards"]').innerHTML = `<h3>${T.laggards}</h3>` + sorted.slice(-6).reverse().map(bar).join('');
  }

  function fail() {
    $('[data-mb="headline"]').textContent = ZH ? '全球金融市場簡報' : 'The Global Markets Brief';
    $('[data-mb="body"]').innerHTML = `<div class="mb-error">${T.error}</div>`;
  }

  // Placeholder date while loading
  const now = new Date(Date.now() + 8 * 3600 * 1000);
  renderMasthead({ date: now.toISOString().slice(0, 10), time: now.toISOString().slice(11, 16), issue: Math.max(1, Math.floor((now - Date.UTC(2026, 9, 27)) / 86400000) + 1) });

  const load = (base) => fetch(`${base}/api/brief?lang=${lang}`, { headers: { Accept: 'application/json' } })
    .then((r) => { if (!r.ok) throw new Error(r.status); return r.json(); })
    .then((d) => { if (!d.quotes || !d.quotes.length) throw new Error('empty'); return d; });
  // Same-origin on Cloudflare Pages; fall back to the official domain when served elsewhere.
  load('')
    .catch(() => load('https://www.mahayanacap.com'))
    .then(render)
    .catch(fail);
})();
