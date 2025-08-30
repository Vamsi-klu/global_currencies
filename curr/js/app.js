// Theme bootstrap: apply saved preference early
(function initTheme() {
  const saved = localStorage.getItem('theme');
  if (saved === 'dark') document.documentElement.classList.add('dark');
})();

document.addEventListener('DOMContentLoaded', () => {
  const grid = document.getElementById('currency-grid');
  const searchBox = document.getElementById('search-box');

  // Theme Toggle
  const themeToggle = document.getElementById('themeToggle');
  themeToggle?.addEventListener('click', () => {
    document.documentElement.classList.toggle('dark');
    localStorage.setItem('theme', document.documentElement.classList.contains('dark') ? 'dark' : 'light');
  });

  function renderCards(data) {
    grid.innerHTML = '';
    if (!data || data.length === 0) {
      grid.innerHTML = `<p class="text-slate-500 col-span-full text-center">No results found.</p>`;
      return;
    }
    data.forEach(item => {
      const card = document.createElement('div');
      card.className = 'bg-white/80 dark:bg-white/5 backdrop-blur p-4 rounded-lg border border-aurora-200/70 dark:border-white/10 shadow hover:shadow-glow hover:-translate-y-1 transition-all duration-300';
      card.innerHTML = `
        <h3 class="font-bold text-slate-900 dark:text-slate-100 text-lg">${item.country}</h3>
        <p class="text-slate-600 dark:text-slate-300">${item.currencyName}</p>
        <p class="text-sm font-mono bg-aurora-50 dark:bg-slate-800 text-aurora-800 dark:text-aurora-200 px-2 py-1 rounded-md mt-2 inline-block">${item.code}</p>
      `;
      grid.appendChild(card);
    });
  }

  function filterData() {
    const query = (searchBox.value || '').toLowerCase();
    const filteredData = window.currencyData.filter(item =>
      item.country.toLowerCase().includes(query) ||
      item.currencyName.toLowerCase().includes(query) ||
      item.code.toLowerCase().includes(query)
    );
    renderCards(filteredData);
  }

  function getCurrencyCounts() {
    const counts = window.currencyData.reduce((acc, curr) => {
      acc[curr.currencyName] = (acc[curr.currencyName] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(counts).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count);
  }

  function updateStats() {
    document.getElementById('total-countries').textContent = window.currencyData.length;
    const uniqueCurrencies = new Set(window.currencyData.map(c => c.currencyName));
    document.getElementById('unique-currencies').textContent = uniqueCurrencies.size;
    const currencyCounts = getCurrencyCounts();
    const mostUsed = currencyCounts[0];
    if (mostUsed) document.getElementById('most-used-currency').textContent = `${mostUsed.name}`;
  }

  function renderChart() {
    const top = getCurrencyCounts().slice(0, 10).reverse();
    const ctx = document.getElementById('currencyChart').getContext('2d');
    // eslint-disable-next-line no-undef
    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: top.map(c => c.name),
        datasets: [{
          label: '# of Countries/Territories',
          data: top.map(c => c.count),
          backgroundColor: 'rgba(99, 102, 241, 0.7)',
          borderColor: 'rgba(99, 102, 241, 1)',
          borderWidth: 1
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { beginAtZero: true, grid: { color: 'rgba(148, 163, 184, 0.2)' } },
          y: { grid: { display: false } }
        }
      }
    });
  }

  searchBox.addEventListener('input', filterData);
  renderCards(window.currencyData);
  updateStats();
  renderChart();
});

