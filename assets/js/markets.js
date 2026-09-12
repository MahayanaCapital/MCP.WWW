(() => {
  if (!window.Chart) return;
  Chart.defaults.animation = false;
  Chart.defaults.font.family = 'DM Sans, sans-serif';

  const lineChart = (canvas, values, color, options = {}) => new Chart(canvas, {
    type: 'line',
    data: {
      labels: values.map((_, index) => index + 1),
      datasets: [{ data: values, borderColor: color, borderWidth: options.width || 1.5, pointRadius: 0, tension: .22, fill: false }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false }, tooltip: { enabled: false } },
      scales: options.axes ? {
        x: { grid: { display: false }, border: { color: '#bfb7ab' }, ticks: { maxTicksLimit: 5, color: '#776c66', font: { size: 8 }, callback: (_, index) => ['Sep', 'Dec', 'Mar', 'Jun', 'Sep'][Math.round(index / 2.75)] || '' } },
        y: { position: 'left', grid: { color: 'rgba(50,40,35,.12)' }, border: { display: false }, ticks: { color: '#776c66', font: { size: 8 }, maxTicksLimit: 4 } }
      } : { x: { display: false }, y: { display: false } }
    }
  });

  document.querySelectorAll('.sparkline,.snapshot-chart').forEach((canvas) => {
    const values = canvas.dataset.values.split(',').map(Number);
    lineChart(canvas, values, canvas.classList.contains('downline') ? '#d64a57' : '#1769e0');
  });

  const feature = document.querySelector('#featureMarketChart');
  if (feature) lineChart(feature, [4850,5010,5200,5380,5620,5790,6020,5880,6260,6480,6220,6710,6900,7350,7657], '#1769e0', { width: 2, axes: true });

  document.querySelectorAll('.bar-chart').forEach((canvas) => {
    const values = canvas.dataset.bars.split(',').map(Number);
    new Chart(canvas, {
      type: 'bar',
      data: { labels: ['', ''], datasets: [{ data: values, backgroundColor: ['#c7d3dd', '#0e2945'], borderWidth: 0, barPercentage: .55, categoryPercentage: .8 }] },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { enabled: false } }, scales: { x: { display: false }, y: { display: false, beginAtZero: true } } },
      plugins: [{ afterDatasetsDraw(chart) { const { ctx } = chart; ctx.save(); ctx.fillStyle = '#3f3834'; ctx.font = '9px DM Sans'; ctx.textAlign = 'center'; chart.getDatasetMeta(0).data.forEach((bar, index) => ctx.fillText(values[index].toLocaleString(), bar.x, bar.y - 5)); ctx.restore(); } }]
    });
  });
})();
