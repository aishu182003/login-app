const form = document.getElementById('signupForm');
const nameInput = document.getElementById('name');
const birthdayInput = document.getElementById('birthday');
const passwordInput = document.getElementById('password');
const submitBtn = document.getElementById('submitBtn');
const formStatus = document.getElementById('formStatus');
const cardsGrid = document.getElementById('cardsGrid');
const emptyState = document.getElementById('emptyState');
const userCount = document.getElementById('userCount');
 
const API_BASE = ''; // same-origin; change to e.g. 'http://localhost:3000' if serving front-end separately
 
function setError(input, errorEl, message){
  errorEl.textContent = message || '';
  input.classList.toggle('invalid', Boolean(message));
}
 
function validate(){
  let ok = true;
 
  if(nameInput.value.trim().length < 2){
    setError(nameInput, document.getElementById('nameError'), 'Enter at least 2 characters.');
    ok = false;
  } else {
    setError(nameInput, document.getElementById('nameError'), '');
  }
 
  if(!birthdayInput.value){
    setError(birthdayInput, document.getElementById('birthdayError'), 'Birthday is required.');
    ok = false;
  } else if (new Date(birthdayInput.value) > new Date()){
    setError(birthdayInput, document.getElementById('birthdayError'), 'Birthday cannot be in the future.');
    ok = false;
  } else {
    setError(birthdayInput, document.getElementById('birthdayError'), '');
  }
 
  if(passwordInput.value.length < 6){
    setError(passwordInput, document.getElementById('passwordError'), 'At least 6 characters.');
    ok = false;
  } else {
    setError(passwordInput, document.getElementById('passwordError'), '');
  }
 
  return ok;
}
 
function calcAge(birthday){
  const b = new Date(birthday);
  const today = new Date();
  let age = today.getFullYear() - b.getFullYear();
  const m = today.getMonth() - b.getMonth();
  if(m < 0 || (m === 0 && today.getDate() < b.getDate())) age--;
  return age;
}
 
function formatDate(iso){
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { year:'numeric', month:'short', day:'numeric' });
}
 
function renderCard(user){
  const card = document.createElement('div');
  card.className = 'user-card';
  card.innerHTML = `
    <span class="card-no">No. ${String(user.id).padStart(4,'0')}</span>
    <div class="card-name">${escapeHtml(user.name)}</div>
    <div class="card-row"><span>Birthday</span><span>${formatDate(user.birthday)}</span></div>
    <div class="card-row"><span>Age</span><span>${calcAge(user.birthday)}</span></div>
    <div class="card-row"><span>Password</span><span>${'•'.repeat(8)}</span></div>
    <div class="card-row"><span>Joined</span><span>${formatDate(user.created_at)}</span></div>
  `;
  return card;
}
 
function escapeHtml(str){
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
 
function renderAll(users){
  cardsGrid.innerHTML = '';
  if(!users.length){
    cardsGrid.appendChild(emptyState);
    userCount.textContent = '0';
    return;
  }
  users.forEach(u => cardsGrid.appendChild(renderCard(u)));
  userCount.textContent = String(users.length);
}
 
async function loadUsers(){
  try{
    const res = await fetch(`${API_BASE}/api/users`);
    if(!res.ok) throw new Error('Failed to load users');
    const users = await res.json();
    renderAll(users);
  } catch(err){
    console.error(err);
    formStatus.textContent = 'Could not load saved users. Is the server running?';
    formStatus.className = 'form-status err';
  }
}
 
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  formStatus.textContent = '';
  formStatus.className = 'form-status';
 
  if(!validate()) return;
 
  submitBtn.disabled = true;
  submitBtn.textContent = 'Saving…';
 
  try{
    const res = await fetch(`${API_BASE}/api/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: nameInput.value.trim(),
        birthday: birthdayInput.value,
        password: passwordInput.value
      })
    });
 
    const data = await res.json();
 
    if(!res.ok){
      throw new Error(data.error || 'Something went wrong.');
    }
 
    formStatus.textContent = 'Saved! Card added below.';
    formStatus.className = 'form-status ok';
    form.reset();
    await loadUsers();
 
  } catch(err){
    formStatus.textContent = err.message;
    formStatus.className = 'form-status err';
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Save & add card';
  }
});
 
loadUsers();