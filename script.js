// =======================================================
// Portfolio Website - Main JavaScript
// =======================================================

const API_BASE = '/api';

document.addEventListener("DOMContentLoaded", async () => {
  initScrollProgress();
  initStickyNav();
  initMobileMenu();
  initShaderBackground();
  
  // Load content dynamically from backend API
  const apiLoadSuccess = await loadDynamicContent();
  
  // Initialize dynamic scroll reveals and image viewer
  initScrollReveal();
  initImageLightbox();
  
  // If API load fails (offline), initialize standard typing effect text
  if (!apiLoadSuccess) {
    initTypingEffect("Software Engineer & Web Developer");
  }
  
  // Setup AJAX contact form submit
  initContactForm();
});

/* -------------------------------------------------------
   1. Scroll Reveal Animation
   Adds the "active" class to elements with class "reveal"
   once they enter the viewport.
------------------------------------------------------- */
function initScrollReveal() {
  const observerOptions = {
    threshold: 0.1,
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("active");
      }
    });
  }, observerOptions);

  document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
}

/* -------------------------------------------------------
   2. Scroll Progress Bar
   Updates the width of the top progress bar based on
   how far the user has scrolled down the page.
------------------------------------------------------- */
function initScrollProgress() {
  const progress = document.getElementById("progress");
  if (!progress) return;

  window.addEventListener("scroll", () => {
    const scrollableHeight =
      document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercent = (window.scrollY / scrollableHeight) * 100;
    progress.style.width = scrollPercent + "%";
  });
}

/* -------------------------------------------------------
   3. Typing Effect
   Types out the role/tagline text in the hero section
   one character at a time.
------------------------------------------------------- */
function initTypingEffect(customText = null) {
  const target = document.getElementById("typing-text");
  if (!target) return;

  const typingText = customText || "Software Engineer & Web Developer";
  target.textContent = "";
  let index = 0;

  function type() {
    if (index < typingText.length) {
      target.textContent += typingText.charAt(index);
      index++;
      setTimeout(type, 100);
    }
  }

  type();
}

/* -------------------------------------------------------
   4. Sticky Nav Hide-on-Scroll-Down
   Hides the navbar when scrolling down and shows it
   again when scrolling up.
------------------------------------------------------- */
function initStickyNav() {
  const nav = document.querySelector(".navbar");
  if (!nav) return;

  let lastScroll = 0;

  window.addEventListener("scroll", () => {
    const currentScroll = window.scrollY;

    if (currentScroll > lastScroll && currentScroll > 100) {
      nav.style.transform = "translateY(-100%)";
    } else {
      nav.style.transform = "translateY(0)";
    }

    lastScroll = currentScroll;
  });
}

/* -------------------------------------------------------
   4b. Mobile Menu Toggle
   Toggles the navigation links drawer and menu icon
   for smaller devices.
------------------------------------------------------- */
function initMobileMenu() {
  const menuBtn = document.querySelector('.navbar__menu-btn');
  const navLinks = document.querySelector('.navbar__links');
  if (!menuBtn || !navLinks) return;

  menuBtn.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    const icon = menuBtn.querySelector('span');
    if (icon) {
      if (navLinks.classList.contains('active')) {
        icon.textContent = 'close';
      } else {
        icon.textContent = 'menu';
      }
    }
  });

  // Close mobile menu when clicking any nav link
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('active');
      const icon = menuBtn.querySelector('span');
      if (icon) icon.textContent = 'menu';
    });
  });
}

/* -------------------------------------------------------
   5. Animated WebGL Shader Background (Hero Section)
   Renders a soft, animated pastel blob gradient using
   a simple fragment shader.
------------------------------------------------------- */
function initShaderBackground() {
  const canvas = document.getElementById("shader-canvas");
  if (!canvas) return;

  function syncSize() {
    const w = canvas.clientWidth || 1280;
    const h = canvas.clientHeight || 720;
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
  }

  if (typeof ResizeObserver !== "undefined") {
    new ResizeObserver(syncSize).observe(canvas);
  }
  syncSize();

  const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
  if (!gl) return;

  const vertexShaderSource = `
    attribute vec2 a_position;
    varying vec2 v_texCoord;
    void main() {
      v_texCoord = a_position * 0.5 + 0.5;
      gl_Position = vec4(a_position, 0.0, 1.0);
    }
  `;

  const fragmentShaderSource = `
    precision highp float;
    varying vec2 v_texCoord;
    uniform float u_time;
    uniform vec2 u_resolution;

    void main() {
        vec2 uv = v_texCoord;

        // Create soft, moving pastel blobs
        float t = u_time * 0.2;

        vec3 color1 = vec3(0.988, 0.820, 0.863); // Soft Pastel Pink (#ffd1dc)
        vec3 color2 = vec3(0.957, 0.706, 0.769); // Dusty Rose (#f4b4c4)
        vec3 color3 = vec3(1.0, 0.898, 0.925);   // Light Peach Pink (#ffe5ec)
        vec3 color4 = vec3(1.0, 0.961, 0.965);   // Soft Rose White (#fff5f6)

        float n1 = sin(uv.x * 3.0 + t) * cos(uv.y * 2.0 - t * 0.5);
        float n2 = sin(uv.y * 4.0 - t * 0.8) * cos(uv.x * 3.0 + t * 0.3);
        float n3 = sin((uv.x + uv.y) * 2.0 + t) * cos(uv.x - uv.y + t);

        vec3 finalColor = color1;
        finalColor = mix(finalColor, color2, smoothstep(-0.5, 0.5, n1));
        finalColor = mix(finalColor, color3, smoothstep(-0.5, 0.5, n2));
        finalColor = mix(finalColor, color4, smoothstep(-0.5, 0.5, n3));

        // Fade out towards the edges for a soft vignette effect
        float vignette = smoothstep(0.8, 0.2, length(uv - 0.5));
        finalColor = mix(vec3(1.0), finalColor, 0.4 + 0.3 * vignette);

        gl_FragColor = vec4(finalColor, 1.0);
    }
  `;

  function compileShader(type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    return shader;
  }

  const program = gl.createProgram();
  gl.attachShader(program, compileShader(gl.VERTEX_SHADER, vertexShaderSource));
  gl.attachShader(program, compileShader(gl.FRAGMENT_SHADER, fragmentShaderSource));
  gl.linkProgram(program);
  gl.useProgram(program);

  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
    gl.STATIC_DRAW
  );

  const positionLocation = gl.getAttribLocation(program, "a_position");
  gl.enableVertexAttribArray(positionLocation);
  gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

  const timeUniform = gl.getUniformLocation(program, "u_time");
  const resolutionUniform = gl.getUniformLocation(program, "u_resolution");
  const mouseUniform = gl.getUniformLocation(program, "u_mouse");

  let mouse = { x: canvas.width / 2, y: canvas.height / 2 };
  window.addEventListener("mousemove", (event) => {
    const rect = canvas.getBoundingClientRect();
    if (rect.width && rect.height) {
      const nx = (event.clientX - rect.left) / rect.width;
      const ny = 1.0 - (event.clientY - rect.top) / rect.height;
      mouse.x = nx * canvas.width;
      mouse.y = ny * canvas.height;
    }
  });

  function render(time) {
    if (typeof ResizeObserver === "undefined") syncSize();
    gl.viewport(0, 0, canvas.width, canvas.height);

    if (timeUniform) gl.uniform1f(timeUniform, time * 0.001);
    if (resolutionUniform)
      gl.uniform2f(resolutionUniform, canvas.width, canvas.height);
    if (mouseUniform) gl.uniform2f(mouseUniform, mouse.x, mouse.y);

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    requestAnimationFrame(render);
  }

  render(0);
}

/* -------------------------------------------------------
   6. Image Lightbox Modal (Featured Projects)
   Allows users to click project images to open them
   in full resolution in a glassmorphism lightbox modal.
------------------------------------------------------- */
function initImageLightbox() {
  const modal = document.getElementById("image-modal");
  const modalImg = document.getElementById("modal-img");
  const captionText = document.getElementById("modal-caption");
  const closeBtn = document.querySelector(".modal__close");

  if (!modal || !modalImg) return;

  const projectMedias = document.querySelectorAll(".project-card__media");
  projectMedias.forEach(media => {
    media.addEventListener("click", () => {
      const bg = media.querySelector(".project-card__media-bg");
      if (!bg) return;
      
      const computedBg = window.getComputedStyle(bg).backgroundImage;
      const imgUrl = computedBg.slice(4, -1).replace(/"/g, "");
      
      const card = media.closest(".project-card");
      const titleEl = card ? card.querySelector(".project-card__title") : null;
      const titleText = titleEl ? titleEl.textContent : "";

      openModal(imgUrl, titleText);
    });
  });

  const certCards = document.querySelectorAll(".cert-card");
  certCards.forEach(card => {
    card.style.cursor = "pointer";
    card.addEventListener("click", () => {
      const img = card.querySelector("img");
      if (img) {
        openModal(img.src, img.alt);
      }
    });
  });

  function openModal(imgUrl, titleText) {
    modal.classList.add("active");
    modalImg.src = imgUrl;
    captionText.textContent = titleText;
    document.body.style.overflow = "hidden"; // Prevent background scroll
  }

  const closeModal = () => {
    modal.classList.remove("active");
    document.body.style.overflow = "";
  };

  if (closeBtn) {
    closeBtn.addEventListener("click", closeModal);
  }
  modal.addEventListener("click", (e) => {
    if (e.target === modal || e.target === closeBtn) {
      closeModal();
    }
  });
}

/* -------------------------------------------------------
   7. Dynamic Content Loader (API Fetch)
   Fetches all portfolio data dynamically from Express API
   endpoints and updates the DOM, with offline static fallbacks.
------------------------------------------------------- */
async function loadDynamicContent() {
  try {
    // 1. Hero & Profile Info
    const heroRes = await fetch(`${API_BASE}/hero`);
    if (!heroRes.ok) throw new Error('Offline mode');
    const hero = await heroRes.json();
    document.querySelector('.hero__name').textContent = hero.name;
    initTypingEffect(hero.role_text);

    const profileRes = await fetch(`${API_BASE}/profile`);
    const profile = await profileRes.json();
    
    const contactEmail = document.getElementById('contact-email');
    const contactLocation = document.getElementById('contact-location');
    if (contactEmail) contactEmail.textContent = profile.email;
    if (contactLocation) contactLocation.textContent = profile.location;
    
    if (profile.cv_path) {
      const cvLinks = document.querySelectorAll('a[href*="CV_"]');
      cvLinks.forEach(link => {
        link.href = profile.cv_path;
        link.setAttribute('download', profile.cv_path.split('/').pop());
      });
    }

    // 2. About Me Info
    const aboutRes = await fetch(`${API_BASE}/about`);
    const about = await aboutRes.json();
    const aboutTextContainer = document.querySelector('.about__text');
    if (aboutTextContainer) {
      aboutTextContainer.innerHTML = `<h2 class="headline-lg">${about.title}</h2>`;
      if (about.bio_paragraph_1) aboutTextContainer.innerHTML += `<p>${about.bio_paragraph_1}</p>`;
      if (about.bio_paragraph_2) aboutTextContainer.innerHTML += `<p>${about.bio_paragraph_2}</p>`;
      if (about.bio_paragraph_3) aboutTextContainer.innerHTML += `<p>${about.bio_paragraph_3}</p>`;
    }
    const aboutImg = document.querySelector('.about__image-wrap img');
    if (aboutImg && about.image_path) {
      aboutImg.src = about.image_path;
    }

    // 3. Skills Grid
    const skillsRes = await fetch(`${API_BASE}/skills`);
    const skills = await skillsRes.json();
    
    const skillsByCategory = {};
    skills.forEach(s => {
      if (!skillsByCategory[s.category]) skillsByCategory[s.category] = [];
      skillsByCategory[s.category].push(s.name);
    });

    const categoryIcons = {
      'Programming': 'code',
      'Backend': 'dns',
      'Frontend Development': 'desktop_windows',
      'Database': 'database',
      'Tools & Technologies': 'terminal',
      'Soft Skills': 'groups'
    };

    const skillsGrid = document.querySelector('#skills .grid');
    if (skillsGrid && skills.length > 0) {
      skillsGrid.innerHTML = '';
      let delay = 0;
      Object.keys(skillsByCategory).forEach(cat => {
        const listItems = skillsByCategory[cat].map(s => `<li>${s}</li>`).join('');
        const delayClass = delay > 0 ? `delay-${delay}` : '';
        skillsGrid.innerHTML += `
          <div class="glass-card shimmer reveal ${delayClass}">
            <span class="material-symbols-outlined glass-card__icon">${categoryIcons[cat] || 'settings'}</span>
            <h3 class="headline-md">${cat}</h3>
            <ul>
              ${listItems}
            </ul>
          </div>
        `;
        delay += 100;
      });
    }

    // 4. Projects Grid
    const projectsRes = await fetch(`${API_BASE}/projects`);
    const projects = await projectsRes.json();
    const projectsGrid = document.querySelector('.projects__grid');
    if (projectsGrid && projects.length > 0) {
      projectsGrid.innerHTML = '';
      projects.forEach((proj, idx) => {
        const delayClass = idx % 2 !== 0 ? 'delay-200' : '';
        const tagsMarkup = proj.tags.split(',').map(t => `<span class="tag">${t.trim()}</span>`).join('');
        projectsGrid.innerHTML += `
          <div class="project-card reveal ${delayClass}">
            <div class="project-card__media">
              <div class="project-card__media-bg" style="background-image: url('${proj.thumbnail_path}')"></div>
            </div>
            <div class="project-card__tags">
              ${tagsMarkup}
            </div>
            <h3 class="headline-md project-card__title">${proj.title}</h3>
            <p class="project-card__desc">${proj.description}</p>
            <a class="project-card__link" href="${proj.github_url}" ${proj.github_url.startsWith('http') ? 'target="_blank" rel="noopener noreferrer"' : ''}>
              View Project <span class="material-symbols-outlined">arrow_forward</span>
            </a>
          </div>
        `;
      });
    }

    // 5. Timeline Experience
    const expRes = await fetch(`${API_BASE}/experience`);
    const experience = await expRes.json();
    const timeline = document.querySelector('.timeline');
    if (timeline && experience.length > 0) {
      timeline.innerHTML = '';
      experience.forEach((exp, idx) => {
        const delayClass = idx % 2 !== 0 ? 'delay-100' : '';
        const isEven = idx % 2 === 0;
        timeline.innerHTML += `
          <div class="timeline-item reveal ${delayClass}">
            <div class="timeline-item__row">
              ${isEven ? `
                <div class="timeline-item__date timeline-item__date--right">${exp.year}</div>
                <div class="timeline-item__dot"></div>
                <div class="timeline-item__content">
                  <div class="glass-card">
                    <span class="timeline-item__date-mobile">${exp.year}</span>
                    <h4 class="headline-md timeline-item__role">${exp.role}</h4>
                    <p class="timeline-item__org">${exp.organization}</p>
                    <p class="timeline-item__desc">${exp.description}</p>
                  </div>
                </div>
              ` : `
                <div class="timeline-item__content">
                  <div class="glass-card">
                    <span class="timeline-item__date-mobile">${exp.year}</span>
                    <h4 class="headline-md timeline-item__role">${exp.role}</h4>
                    <p class="timeline-item__org">${exp.organization}</p>
                    <p class="timeline-item__desc">${exp.description}</p>
                  </div>
                </div>
                <div class="timeline-item__dot"></div>
                <div class="timeline-item__date timeline-item__date--left">${exp.year}</div>
              `}
            </div>
          </div>
        `;
      });
    }

    // 6. Certificates Grid
    const certRes = await fetch(`${API_BASE}/certificates`);
    const certificates = await certRes.json();
    const certGrid = document.querySelector('.cert-grid');
    if (certGrid && certificates.length > 0) {
      certGrid.innerHTML = '';
      certificates.forEach(cert => {
        certGrid.innerHTML += `
          <div class="cert-card glass-card reveal ${cert.delay_class || ''}">
            <img src="${cert.image_path}" alt="${cert.title}" />
          </div>
        `;
      });
    }

    // 7. Social Links
    const socialsRes = await fetch(`${API_BASE}/socials`);
    const socials = await socialsRes.json();
    const heroSocials = document.querySelector('.hero__socials');
    const contactSocials = document.querySelector('.contact-socials');
    
    const getSocialIconClass = (platform) => {
      if (platform.toLowerCase() === 'github') return 'bi bi-github';
      if (platform.toLowerCase() === 'linkedin') return 'bi bi-linkedin';
      if (platform.toLowerCase() === 'instagram') return 'bi bi-instagram';
      return 'bi bi-link-45deg';
    };

    if (socials.length > 0) {
      if (heroSocials) {
        heroSocials.innerHTML = '';
        socials.forEach(s => {
          heroSocials.innerHTML += `
            <a class="hero__social-link" href="${s.url}" target="_blank" rel="noopener noreferrer" aria-label="${s.platform}">
              <i class="${getSocialIconClass(s.platform)}"></i>
            </a>
          `;
        });
      }
      if (contactSocials) {
        contactSocials.innerHTML = '';
        socials.forEach(s => {
          contactSocials.innerHTML += `
            <a class="contact-social-btn" href="${s.url}" target="_blank" rel="noopener noreferrer" aria-label="${s.platform}">
              <i class="${getSocialIconClass(s.platform)}" style="font-size: 20px;"></i>
            </a>
          `;
        });
      }
    }

    return true;
  } catch (error) {
    console.warn('API endpoint connection offline. Using static HTML content.', error);
    return false;
  }
}

/* -------------------------------------------------------
   8. AJAX Contact Form Submit
   Intercepts form submit, sends content to Express route via
   JSON POST, and displays confirmation feedback.
------------------------------------------------------- */
function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('full-name').value;
    const email = document.getElementById('email').value;
    const message = document.getElementById('message').value;

    try {
      const res = await fetch(`${API_BASE}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message })
      });
      const data = await res.json();
      
      if (data.success) {
        alert('Thank you! Your message has been sent successfully.');
        form.reset();
      } else {
        alert('Submission failed: ' + data.message);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Could not submit. Please check your internet connection.');
    }
  });
}
