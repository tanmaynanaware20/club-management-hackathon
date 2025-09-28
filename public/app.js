// Frontend JS to interact with backend API
async function fetchClubs(){
  const res = await fetch('/api/clubs');
  const data = await res.json();
  const container = document.getElementById('clubsList');
  container.innerHTML = '';
  if (data.length === 0) {
    container.innerHTML = '<p>No clubs yet. Add one!</p>';
    return;
  }
  data.forEach(c => {
    const div = document.createElement('div');
    div.className = 'card';
    div.innerHTML = `<h3>${escapeHtml(c.name)}</h3>
      <p class="meta">${escapeHtml(c.contact)} · ${escapeHtml(c.meetings)}</p>
      <p>${escapeHtml(c.description)}</p>
      <button class="del-btn" onclick="deleteClub(${c.id})">Delete</button>`;
    container.appendChild(div);
  });
}

function escapeHtml(s){ if(!s) return ''; return s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;'); }

document.getElementById('clubForm').addEventListener('submit', async (e)=>{
  e.preventDefault();
  const payload = {
    name: document.getElementById('name').value.trim(),
    contact: document.getElementById('contact').value.trim(),
    meetings: document.getElementById('meetings').value.trim(),
    description: document.getElementById('description').value.trim()
  };
  if (!payload.name) { alert('Name is required'); return; }
  const res = await fetch('/api/clubs', {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify(payload)
  });
  if (res.ok) {
    document.getElementById('clubForm').reset();
    fetchClubs();
  } else {
    const err = await res.json();
    alert('Error: ' + (err.error || 'Unknown'));
  }
});

async function deleteClub(id){
  if(!confirm('Delete this club?')) return;
  const res = await fetch('/api/clubs/' + id, { method: 'DELETE' });
  if (res.ok) fetchClubs();
  else {
    const err = await res.json();
    alert('Error: ' + (err.error || 'Unknown'));
  }
}

// initial load
fetchClubs();