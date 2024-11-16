let timerInterval;
let elapsedTime = 0;
let selectedActivity = "Email";

function formatTime(seconds) {
  const hours = String(Math.floor(seconds / 3600)).padStart(2, '0');
  const minutes = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
  const secs = String(seconds % 60).padStart(2, '0');
  return `${hours}:${minutes}:${secs}`;
}

async function updateCumulativeTable() {
  const response = await fetch('/activities');
  const data = await response.json();
  const tableBody = document.getElementById('activityTableBody');
  tableBody.innerHTML = '';
  data.forEach(({ activity, time }) => {
    const row = document.createElement('tr');
    row.innerHTML = `<td>${activity}</td><td>${formatTime(time)}</td>`;
    tableBody.appendChild(row);
  });
}

document.getElementById('startButton').addEventListener('click', () => {
  if (timerInterval) return;
  timerInterval = setInterval(() => {
    elapsedTime++;
    document.querySelector('.time-display').textContent = formatTime(elapsedTime);
  }, 1000);
});

document.getElementById('stopButton').addEventListener('click', async () => {
  clearInterval(timerInterval);
  timerInterval = null;
  await fetch('/update', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ activity: selectedActivity, time: elapsedTime }),
  });
  elapsedTime = 0;
  document.querySelector('.time-display').textContent = formatTime(elapsedTime);
  await updateCumulativeTable();
});

document.getElementById('resetButton').addEventListener('click', () => {
  clearInterval(timerInterval);
  timerInterval = null;
  elapsedTime = 0;
  document.querySelector('.time-display').textContent = formatTime(elapsedTime);
});

document.getElementById('activitySelect').addEventListener('change', (e) => {
  selectedActivity = e.target.value;
});

updateCumulativeTable();
