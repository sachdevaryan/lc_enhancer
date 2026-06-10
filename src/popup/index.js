// Popup runs in isolated world — chrome.storage is available directly

async function storageGet(key) {
  return new Promise((resolve) => {
    chrome.storage.local.get(key, (result) => resolve(result[key] ?? null));
  });
}

async function getAllKeys() {
  return new Promise((resolve) => {
    chrome.storage.local.get(null, (items) => resolve(items));
  });
}

async function init() {
  const all = await getAllKeys();

  // Collect daily stats from storage
  const statsMap = {};
  Object.keys(all).forEach(key => {
    if (key.startsWith('stats:')) {
      const date = key.replace('stats:', '');
      statsMap[date] = all[key];
    }
  });

  // Count total problems (unique history keys)
  const historyKeys = Object.keys(all).filter(k => k.startsWith('history:'));
  const totalProblems = historyKeys.length;

  // Count total snapshots
  let totalSnapshots = 0;
  historyKeys.forEach(k => {
    if (Array.isArray(all[k])) totalSnapshots += all[k].length;
  });

  // Current streak
  const streak = calcStreak(statsMap);

  // This week's count
  const weekCount = calcWeekCount(statsMap);

  renderStats(totalProblems, streak, weekCount, totalSnapshots);
  renderHeatmap(statsMap);
}

function calcStreak(statsMap) {
  let streak = 0;
  const today = new Date();
  for (let i = 0; i < 365; i++) {
    const d = dateStr(today, -i);
    if (statsMap[d] && statsMap[d] > 0) {
      streak++;
    } else if (i > 0) {
      break;
    }
  }
  return streak;
}

function calcWeekCount(statsMap) {
  let count = 0;
  const today = new Date();
  for (let i = 0; i < 7; i++) {
    const d = dateStr(today, -i);
    count += statsMap[d] || 0;
  }
  return count;
}

function dateStr(base, offsetDays) {
  const d = new Date(base);
  d.setDate(d.getDate() + offsetDays);
  const offset = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - offset).toISOString().slice(0, 10);
}

function renderStats(total, streak, week, snapshots) {
  document.getElementById('stat-total').textContent = total;
  document.getElementById('stat-streak').textContent = streak;
  document.getElementById('stat-week').textContent = week;
  document.getElementById('stat-snaps').textContent = snapshots;
}

function renderHeatmap(statsMap) {
  const container = document.getElementById('heatmap');
  container.innerHTML = '';

  const today = new Date();
  const days = 91; // 13 weeks
  const cells = [];

  for (let i = days - 1; i >= 0; i--) {
    const d = dateStr(today, -i);
    cells.push({ date: d, count: statsMap[d] || 0 });
  }

  // Find max for intensity scaling
  const max = Math.max(...cells.map(c => c.count), 1);

  // Group into weeks (columns)
  const weeks = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }

  weeks.forEach(week => {
    const col = document.createElement('div');
    col.className = 'hm-col';
    week.forEach(day => {
      const cell = document.createElement('div');
      cell.className = 'hm-cell';
      const intensity = day.count === 0 ? 0 : Math.ceil((day.count / max) * 4);
      cell.dataset.level = intensity;
      cell.title = `${day.date}: ${day.count} snapshot${day.count !== 1 ? 's' : ''}`;
      col.appendChild(cell);
    });
    container.appendChild(col);
  });
}

// Month labels for heatmap
function renderMonthLabels(cells) {
  const labels = document.getElementById('heatmap-months');
  if (!labels) return;
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  let lastMonth = -1;
  cells.forEach((cell, i) => {
    const m = new Date(cell.date).getMonth();
    if (m !== lastMonth) {
      lastMonth = m;
      const span = document.createElement('span');
      span.textContent = months[m];
      span.style.gridColumn = Math.floor(i / 7) + 1;
      labels.appendChild(span);
    }
  });
}

document.addEventListener('DOMContentLoaded', init);