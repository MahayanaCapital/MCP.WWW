(() => {
  const grid = document.querySelector('.global-market-grid');
  if (!grid) return;

  const locale = grid.dataset.locale || 'en';
  const labels = {
    en: ['Americas', 'Europe', 'Asia Pacific', 'Emerging Markets'],
    'zh-TW': ['美洲市場', '歐洲市場', '亞太市場', '新興市場']
  }[locale] || ['Americas', 'Europe', 'Asia Pacific', 'Emerging Markets'];
  const tvLocale = { 'zh-TW': 'zh_TW' }[locale] || 'en';
  const regions = [
    [
      ['FOREXCOM:SPXUSD', 'S&P 500'], ['NASDAQ:NDX', 'Nasdaq 100'],
      ['FOREXCOM:DJI', 'Dow Jones'], ['TSX:TSX', 'Canada S&P/TSX'],
      ['BMFBOVESPA:IBOV', 'Brazil Bovespa'], ['BMV:ME', 'Mexico IPC']
    ],
    [
      ['INDEX:DEU40', 'Germany DAX'], ['TVC:UKX', 'UK FTSE 100'],
      ['EURONEXT:PX1', 'France CAC 40'], ['BME:IBC', 'Spain IBEX 35'],
      ['MIL:FTSEMIB', 'Italy FTSE MIB'], ['SIX:SMI', 'Switzerland SMI']
    ],
    [
      ['SSE:000001', 'Shanghai Composite'], ['HKEX:HSI', 'Hang Seng'],
      ['INDEX:NKY', 'Nikkei 225'], ['KRX:KOSPI', 'Korea KOSPI'],
      ['TWSE:TAIEX', 'Taiwan Weighted'], ['ASX:XJO', 'Australia ASX 200']
    ],
    [
      ['NSE:NIFTY', 'India Nifty 50'], ['BIST:XU100', 'Türkiye BIST 100'],
      ['TADAWUL:TASI', 'Saudi Arabia TASI'], ['IDX:COMPOSITE', 'Indonesia Composite'],
      ['SET:SET', 'Thailand SET'], ['JSE:J200', 'South Africa Top 40']
    ]
  ];

  grid.replaceChildren();
  regions.forEach((symbols, index) => {
    const panel = document.createElement('article');
    panel.className = 'market-region-panel';
    const heading = document.createElement('h2');
    heading.className = 'market-region-title';
    heading.textContent = labels[index];
    const widget = document.createElement('div');
    widget.className = 'tradingview-widget-container';
    widget.innerHTML = '<div class="tradingview-widget-container__widget"></div>';
    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-market-overview.js';
    script.async = true;
    script.textContent = JSON.stringify({
      colorTheme: 'light', dateRange: '1M', locale: tvLocale, largeChartUrl: '',
      isTransparent: true, showFloatingTooltip: true, showSymbolLogo: false,
      showChart: true, width: '100%', height: '560',
      tabs: [{ title: labels[index], symbols: symbols.map(([s, d]) => ({ s, d })) }]
    });
    widget.appendChild(script);
    panel.append(heading, widget);
    grid.appendChild(panel);
  });
})();
