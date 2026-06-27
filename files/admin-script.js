// =======================================================
// Admin Dashboard - Interactive Logic (admin-script.js)
// =======================================================

const API_BASE = '/api';
let jwtToken = localStorage.getItem('admin_token') || '';

document.addEventListener("DOMContentLoaded", () => {
  checkAuth();
  setupEventListeners();
});

// Check if authenticated
async function checkAuth() {
  if (!jwtToken) {
    showLogin();
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/auth/verify`, {
      headers: { 'Authorization': `Bearer ${jwtToken}` }
    });
    const data = await res.json();

    if (data.success) {
      showDashboard();
    } else {
      logout();
    }
  } catch (error) {
    console.error('Auth verification error:', error);
    logout();
  }
}

function showLogin() {
  document.getElementById('login-container').style.display = 'flex';
  document.getElementById('dashboard-container').style.display = 'none';
}

function showDashboard() {
  document.getElementById('login-container').style.display = 'none';
  document.getElementById('dashboard-container').style.display = 'flex';
  loadTabContent('hero-profile'); // Load default tab
  loadInboxCount();
}

function logout() {
  localStorage.removeItem('admin_token');
  jwtToken = '';
  showLogin();
}

// Global Event Listeners Setup
function setupEventListeners() {
  // Login Form
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
  }

  // Logout Button
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', logout);
  }

  // Tab buttons click
  const tabBtns = document.querySelectorAll('.nav-tab-btn');
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const tabId = btn.getAttribute('data-tab');
      loadTabContent(tabId);
    });
  });

  // Hero & Profile Submit
  document.getElementById('hero-profile-form').addEventListener('submit', saveHeroProfile);

  // About Submit
  document.getElementById('about-form').addEventListener('submit', saveAbout);

  // Add Skill Submit
  document.getElementById('add-skill-form').addEventListener('submit', addSkill);

  // Add Experience Submit
  document.getElementById('add-exp-form').addEventListener('submit', addExperience);

  // Add Certificate Submit
  document.getElementById('add-cert-form').addEventListener('submit', addCertificate);

  // Socials Submit
  document.getElementById('socials-form').addEventListener('submit', saveSocials);

  // Project Modal Actions
  document.getElementById('btn-add-project').addEventListener('click', () => openProjectModal());
  document.getElementById('project-modal-close').addEventListener('click', closeProjectModal);
  document.getElementById('btn-project-cancel').addEventListener('click', closeProjectModal);
  document.getElementById('project-form').addEventListener('submit', saveProject);
}

// 1. Auth - Handle Sign In
async function handleLogin(e) {
  e.preventDefault();
  const usernameVal = document.getElementById('username').value;
  const passwordVal = document.getElementById('password').value;
  const errorEl = document.getElementById('login-error');

  errorEl.textContent = '';

  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: usernameVal, password: passwordVal })
    });
    const data = await res.json();

    if (data.success) {
      jwtToken = data.token;
      localStorage.setItem('admin_token', jwtToken);
      showDashboard();
    } else {
      errorEl.textContent = data.message || 'Login failed.';
    }
  } catch (error) {
    errorEl.textContent = 'Server connection error.';
  }
}

// Helper: API requests with JWT Auth header
async function secureRequest(url, method = 'GET', body = null, isMultipart = false) {
  const headers = { 'Authorization': `Bearer ${jwtToken}` };
  if (!isMultipart) {
    headers['Content-Type'] = 'application/json';
  }

  const options = { method, headers };
  if (body) {
    options.body = isMultipart ? body : JSON.stringify(body);
  }

  const res = await fetch(url, options);
  if (res.status === 401) {
    logout();
    throw new Error('Session expired');
  }
  return res.json();
}

// Load Content based on active tab
function loadTabContent(tabId) {
  const tabContents = document.querySelectorAll('.tab-content');
  tabContents.forEach(content => content.classList.remove('active'));
  
  const targetContent = document.getElementById(tabId);
  if (targetContent) {
    targetContent.classList.add('active');
  }

  switch(tabId) {
    case 'hero-profile':
      loadHeroProfileData();
      break;
    case 'about-tab':
      loadAboutData();
      break;
    case 'skills-tab':
      loadSkillsData();
      break;
    case 'projects-tab':
      loadProjectsData();
      break;
    case 'experience-tab':
      loadExperienceData();
      break;
    case 'certificates-tab':
      loadCertificatesData();
      break;
    case 'socials-tab':
      loadSocialsData();
      break;
    case 'inbox-tab':
      loadInboxData();
      break;
  }
}

// Update message count badge
async function loadInboxCount() {
  try {
    const messages = await secureRequest(`${API_BASE}/admin/messages`);
    const count = messages.length;
    const badge = document.getElementById('inbox-count');
    if (badge) {
      badge.textContent = count;
      badge.style.display = count > 0 ? 'inline-block' : 'none';
    }
  } catch (err) {
    console.error(err);
  }
}

// ==========================================
// TAB CONTROLLERS & CRUD ACTIONS
// ==========================================

// 1. Hero & Profile Settings
async function loadHeroProfileData() {
  try {
    const heroRes = await fetch(`${API_BASE}/hero`);
    const hero = await heroRes.json();
    document.getElementById('hero-name').value = hero.name || '';
    document.getElementById('hero-role').value = hero.role_text || '';

    const profileRes = await fetch(`${API_BASE}/profile`);
    const profile = await profileRes.json();
    document.getElementById('profile-email').value = profile.email || '';
    document.getElementById('profile-location').value = profile.location || '';
    document.getElementById('cv-current-path').textContent = profile.cv_path ? `Current: ${profile.cv_path}` : 'No file uploaded';
  } catch (err) {
    alert('Error loading profile data');
  }
}

async function saveHeroProfile(e) {
  e.preventDefault();
  const name = document.getElementById('hero-name').value;
  const role_text = document.getElementById('hero-role').value;
  const email = document.getElementById('profile-email').value;
  const location = document.getElementById('profile-location').value;
  const cvFile = document.getElementById('profile-cv').files[0];

  try {
    // 1. Save Hero Info
    await secureRequest(`${API_BASE}/admin/hero`, 'POST', { name, role_text });

    // 2. Save Profile Info (Multipart for CV)
    const formData = new FormData();
    formData.append('email', email);
    formData.append('location', location);
    if (cvFile) {
      formData.append('cv', cvFile);
    }
    const profileRes = await secureRequest(`${API_BASE}/admin/profile`, 'POST', formData, true);

    if (profileRes.success) {
      alert('Hero and Profile settings saved successfully!');
      loadHeroProfileData();
    } else {
      alert('Error: ' + profileRes.message);
    }
  } catch (err) {
    console.error(err);
  }
}

// 2. About Me Settings
async function loadAboutData() {
  try {
    const res = await fetch(`${API_BASE}/about`);
    const about = await res.json();
    document.getElementById('about-title').value = about.title || '';
    document.getElementById('about-p1').value = about.bio_paragraph_1 || '';
    document.getElementById('about-p2').value = about.bio_paragraph_2 || '';
    document.getElementById('about-p3').value = about.bio_paragraph_3 || '';
    document.getElementById('about-current-img').textContent = about.image_path ? `Current image: ${about.image_path}` : 'No image uploaded';
  } catch (err) {
    alert('Error loading About data');
  }
}

async function saveAbout(e) {
  e.preventDefault();
  const title = document.getElementById('about-title').value;
  const bio_paragraph_1 = document.getElementById('about-p1').value;
  const bio_paragraph_2 = document.getElementById('about-p2').value;
  const bio_paragraph_3 = document.getElementById('about-p3').value;
  const imgFile = document.getElementById('about-image').files[0];

  const formData = new FormData();
  formData.append('title', title);
  formData.append('bio_paragraph_1', bio_paragraph_1);
  formData.append('bio_paragraph_2', bio_paragraph_2);
  formData.append('bio_paragraph_3', bio_paragraph_3);
  if (imgFile) {
    formData.append('about_image', imgFile);
  }

  try {
    const res = await secureRequest(`${API_BASE}/admin/about`, 'POST', formData, true);
    if (res.success) {
      alert('About settings saved successfully!');
      loadAboutData();
    } else {
      alert('Error: ' + res.message);
    }
  } catch (err) {
    console.error(err);
  }
}

// 3. Skills Settings
async function loadSkillsData() {
  try {
    const res = await fetch(`${API_BASE}/skills`);
    const skills = await res.json();
    const listEl = document.getElementById('skills-admin-list');
    listEl.innerHTML = '';

    skills.forEach(skill => {
      const row = document.createElement('div');
      row.className = 'admin-item-row';
      row.innerHTML = `
        <div class="item-info">
          <span class="item-label">${skill.category}</span>
          <span class="item-value">${skill.name}</span>
        </div>
        <button class="btn-icon btn-icon--delete" onclick="deleteSkill(${skill.id})">
          <span class="material-symbols-outlined">delete</span>
        </button>
      `;
      listEl.appendChild(row);
    });
  } catch (err) {
    alert('Error loading Skills list');
  }
}

async function addSkill(e) {
  e.preventDefault();
  const category = document.getElementById('skill-category').value;
  const name = document.getElementById('skill-name').value;

  try {
    const res = await secureRequest(`${API_BASE}/admin/skills`, 'POST', { category, name });
    if (res.success) {
      document.getElementById('skill-name').value = '';
      loadSkillsData();
    } else {
      alert('Error: ' + res.message);
    }
  } catch (err) {
    console.error(err);
  }
}

window.deleteSkill = async function(id) {
  if (!confirm('Are you sure you want to delete this skill?')) return;
  try {
    const res = await secureRequest(`${API_BASE}/admin/skills/${id}`, 'DELETE');
    if (res.success) {
      loadSkillsData();
    }
  } catch (err) {
    console.error(err);
  }
};

// 4. Projects Settings
async function loadProjectsData() {
  try {
    const res = await fetch(`${API_BASE}/projects`);
    const projects = await res.json();
    const listEl = document.getElementById('projects-admin-list');
    listEl.innerHTML = '';

    projects.forEach(proj => {
      const card = document.createElement('div');
      card.className = 'admin-project-card';
      card.innerHTML = `
        <img src="${proj.thumbnail_path}" alt="${proj.title}" />
        <div class="admin-project-card__details">
          <h4>${proj.title}</h4>
          <p>${proj.description.substring(0, 100)}...</p>
        </div>
        <div class="item-actions">
          <button class="btn-icon btn-icon--edit" onclick="openProjectModal(${JSON.stringify(proj).replace(/"/g, '&quot;')})">
            <span class="material-symbols-outlined">edit</span>
          </button>
          <button class="btn-icon btn-icon--delete" onclick="deleteProject(${proj.id})">
            <span class="material-symbols-outlined">delete</span>
          </button>
        </div>
      `;
      listEl.appendChild(card);
    });
  } catch (err) {
    alert('Error loading Projects list');
  }
}

function openProjectModal(project = null) {
  const modal = document.getElementById('project-overlay');
  document.getElementById('project-modal').style.display = 'flex';
  
  if (project) {
    document.getElementById('project-modal-title').textContent = 'Edit Project';
    document.getElementById('project-id').value = project.id;
    document.getElementById('proj-title').value = project.title;
    document.getElementById('proj-desc').value = project.description;
    document.getElementById('proj-tags').value = project.tags;
    document.getElementById('proj-url').value = project.github_url;
    document.getElementById('proj-current-img').textContent = `Current: ${project.thumbnail_path}`;
  } else {
    document.getElementById('project-modal-title').textContent = 'Add Project';
    document.getElementById('project-id').value = '';
    document.getElementById('project-form').reset();
    document.getElementById('proj-current-img').textContent = '';
  }
}

function closeProjectModal() {
  document.getElementById('project-modal').style.display = 'none';
}

async function saveProject(e) {
  e.preventDefault();
  const id = document.getElementById('project-id').value;
  const title = document.getElementById('proj-title').value;
  const description = document.getElementById('proj-desc').value;
  const tags = document.getElementById('proj-tags').value;
  const github_url = document.getElementById('proj-url').value;
  const fileInput = document.getElementById('proj-image').files[0];

  const formData = new FormData();
  formData.append('title', title);
  formData.append('description', description);
  formData.append('tags', tags);
  formData.append('github_url', github_url);
  if (fileInput) {
    formData.append('thumbnail', fileInput);
  }

  try {
    let res;
    if (id) {
      // Edit mode (PUT)
      res = await secureRequest(`${API_BASE}/admin/projects/${id}`, 'PUT', formData, true);
    } else {
      // Add mode (POST)
      res = await secureRequest(`${API_BASE}/admin/projects`, 'POST', formData, true);
    }

    if (res.success) {
      closeProjectModal();
      loadProjectsData();
    } else {
      alert('Error: ' + res.message);
    }
  } catch (err) {
    console.error(err);
  }
}

window.deleteProject = async function(id) {
  if (!confirm('Are you sure you want to delete this project?')) return;
  try {
    const res = await secureRequest(`${API_BASE}/admin/projects/${id}`, 'DELETE');
    if (res.success) {
      loadProjectsData();
    }
  } catch (err) {
    console.error(err);
  }
};

// 5. Experience Settings
async function loadExperienceData() {
  try {
    const res = await fetch(`${API_BASE}/experience`);
    const experiences = await res.json();
    const listEl = document.getElementById('experience-admin-list');
    listEl.innerHTML = '';

    experiences.forEach(exp => {
      const row = document.createElement('div');
      row.className = 'admin-item-row';
      row.innerHTML = `
        <div class="item-info">
          <span class="item-label">${exp.year}</span>
          <span class="item-value">${exp.role} - ${exp.organization}</span>
        </div>
        <button class="btn-icon btn-icon--delete" onclick="deleteExperience(${exp.id})">
          <span class="material-symbols-outlined">delete</span>
        </button>
      `;
      listEl.appendChild(row);
    });
  } catch (err) {
    alert('Error loading Experience list');
  }
}

async function addExperience(e) {
  e.preventDefault();
  const year = document.getElementById('exp-year').value;
  const role = document.getElementById('exp-role').value;
  const organization = document.getElementById('exp-org').value;
  const description = document.getElementById('exp-desc').value;

  try {
    const res = await secureRequest(`${API_BASE}/admin/experience`, 'POST', { year, role, organization, description });
    if (res.success) {
      document.getElementById('add-exp-form').reset();
      loadExperienceData();
    } else {
      alert('Error: ' + res.message);
    }
  } catch (err) {
    console.error(err);
  }
}

window.deleteExperience = async function(id) {
  if (!confirm('Are you sure you want to delete this experience entry?')) return;
  try {
    const res = await secureRequest(`${API_BASE}/admin/experience/${id}`, 'DELETE');
    if (res.success) {
      loadExperienceData();
    }
  } catch (err) {
    console.error(err);
  }
};

// 6. Certificates Settings
async function loadCertificatesData() {
  try {
    const res = await fetch(`${API_BASE}/certificates`);
    const certs = await res.json();
    const listEl = document.getElementById('certificates-admin-list');
    listEl.innerHTML = '';

    certs.forEach(cert => {
      const row = document.createElement('div');
      row.className = 'admin-item-row';
      row.innerHTML = `
        <div class="item-info">
          <span class="item-label">${cert.delay_class || 'No Delay'}</span>
          <span class="item-value">${cert.title}</span>
        </div>
        <button class="btn-icon btn-icon--delete" onclick="deleteCertificate(${cert.id})">
          <span class="material-symbols-outlined">delete</span>
        </button>
      `;
      listEl.appendChild(row);
    });
  } catch (err) {
    alert('Error loading certificates list');
  }
}

async function addCertificate(e) {
  e.preventDefault();
  const title = document.getElementById('cert-title').value;
  const fileInput = document.getElementById('cert-file').files[0];
  const delay_class = document.getElementById('cert-delay').value;

  const formData = new FormData();
  formData.append('title', title);
  formData.append('certificate_image', fileInput);
  formData.append('delay_class', delay_class);

  try {
    const res = await secureRequest(`${API_BASE}/admin/certificates`, 'POST', formData, true);
    if (res.success) {
      document.getElementById('add-cert-form').reset();
      loadCertificatesData();
    } else {
      alert('Error: ' + res.message);
    }
  } catch (err) {
    console.error(err);
  }
}

window.deleteCertificate = async function(id) {
  if (!confirm('Are you sure you want to delete this certificate?')) return;
  try {
    const res = await secureRequest(`${API_BASE}/admin/certificates/${id}`, 'DELETE');
    if (res.success) {
      loadCertificatesData();
    }
  } catch (err) {
    console.error(err);
  }
};

// 7. Socials Settings
async function loadSocialsData() {
  try {
    const res = await fetch(`${API_BASE}/socials`);
    const socials = await res.json();
    socials.forEach(social => {
      if (social.platform === 'GitHub') {
        document.getElementById('social-github').value = social.url || '';
      } else if (social.platform === 'LinkedIn') {
        document.getElementById('social-linkedin').value = social.url || '';
      } else if (social.platform === 'Instagram') {
        document.getElementById('social-instagram').value = social.url || '';
      }
    });
  } catch (err) {
    alert('Error loading Social links');
  }
}

async function saveSocials(e) {
  e.preventDefault();
  const github = document.getElementById('social-github').value;
  const linkedin = document.getElementById('social-linkedin').value;
  const instagram = document.getElementById('social-instagram').value;

  try {
    // Sequentially save
    await secureRequest(`${API_BASE}/admin/socials`, 'POST', { platform: 'GitHub', url: github });
    await secureRequest(`${API_BASE}/admin/socials`, 'POST', { platform: 'LinkedIn', url: linkedin });
    const res = await secureRequest(`${API_BASE}/admin/socials`, 'POST', { platform: 'Instagram', url: instagram });

    if (res.success) {
      alert('Social links saved successfully!');
      loadSocialsData();
    }
  } catch (err) {
    console.error(err);
  }
}

// 8. Inbox Tab
async function loadInboxData() {
  try {
    const messages = await secureRequest(`${API_BASE}/admin/messages`);
    const listEl = document.getElementById('inbox-admin-list');
    listEl.innerHTML = '';

    if (messages.length === 0) {
      listEl.innerHTML = '<p class="text-secondary" style="text-align: center; padding: 2rem;">No messages in your inbox.</p>';
      return;
    }

    messages.forEach(msg => {
      const card = document.createElement('div');
      card.className = 'message-card';
      const formattedDate = new Date(msg.created_at).toLocaleString();
      card.innerHTML = `
        <div class="message-card__header">
          <div class="message-card__sender">
            <h4>${msg.full_name}</h4>
            <span>${msg.email}</span>
          </div>
          <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 0.5rem;">
            <span class="message-card__date">${formattedDate}</span>
            <button class="btn-icon btn-icon--delete" onclick="deleteMessage(${msg.id})">
              <span class="material-symbols-outlined">delete</span>
            </button>
          </div>
        </div>
        <div class="message-card__body">${msg.message}</div>
      `;
      listEl.appendChild(card);
    });
  } catch (err) {
    alert('Error loading messages');
  }
}

window.deleteMessage = async function(id) {
  if (!confirm('Are you sure you want to delete this message?')) return;
  try {
    const res = await secureRequest(`${API_BASE}/admin/messages/${id}`, 'DELETE');
    if (res.success) {
      loadInboxData();
      loadInboxCount();
    }
  } catch (err) {
    console.error(err);
  }
};
