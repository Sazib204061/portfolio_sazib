/* ═══════════════════════════════════════
   DATA-DRIVEN PORTFOLIO — app.js
   All content from data.json. No hardcoded data here.
═══════════════════════════════════════ */

let DATA = {};
let MAIN = ""; // accumulated <main> HTML
let NAV = []; // { id, label } for nav + footer
let SEC = 0; // section counter

const $ = (id) => document.getElementById(id);

fetch("data.json")
  .then((res) => res.json())
  .then((data) => {
    DATA = data;
    renderAll(data);
  })
  .catch((err) => console.error("Failed to load data.json", err));

/* ─── helpers ─── */
function num() {
  SEC++;
  return String(SEC).padStart(2, "0");
}

function head(n, title) {
  return `<div class="sec-head reveal"><span class="sec-num">${n}</span><h2>${title}</h2><span class="sec-line"></span></div>`;
}

// Add a <main> section. navVisible=true → add to nav bar.
function addSection(id, title, inner, navVisible) {
  const n = num();
  if (navVisible) NAV.push({ id, label: title });
  MAIN += `<section id="${id}" class="page sec">${head(n, title)}${inner}</section>`;
}

function iconClass(icon) {
  const map = {
    github: "fab fa-github",
    linkedin: "fab fa-linkedin",
    leetcode: "fas fa-code",
    code: "fas fa-code",
    twitter: "fab fa-twitter",
    facebook: "fab fa-facebook",
  };
  return map[(icon || "").toLowerCase()] || "fas fa-link";
}

function heroName(name) {
  const w = name.trim().split(/\s+/);
  if (w.length >= 3)
    return `${w[0]} <em>${w[1]}</em><br />${w.slice(2).join(" ")}`;
  if (w.length === 2) return `${w[0]} <em>${w[1]}</em>`;
  return name;
}

function tagSpans(tags) {
  return (tags || []).map((t) => `<span class="tag">${t}</span>`).join("");
}

// Return items if non-empty, else a single dummy placeholder
function withDummy(items, dummy) {
  return items && items.length ? items : [dummy];
}

/* ─── orchestrator ─── */
function renderAll(data) {
  renderProfile(data.profile);
  renderSummary(data.summary);
  renderExperience(data.experience);
  renderEducation(data.education);
  renderSkills(data.skills);
  renderCompetitiveProgramming(data.competitiveProgramming);
  renderLeadership(data.leadership);
  renderProjects(data.projects);
  renderAwards(data.awards);
  renderCertifications(data.certifications);
  renderSeminars(data.seminars);
  renderContact(data.contact);

  $("main-root").innerHTML = MAIN;
  renderNav();
  buildFooter(data.contact);
  initInteractions();
  initContactForm(data.contact);
}

/* ─── PROFILE → nav name + hero ─── */
function renderProfile(p) {
  if (!p || !p.isActive) return;
  const initial = p.name.trim().charAt(0);
  $("nav-name").innerHTML = `<span class="logo-mark">${initial}</span> ${p.name}`;

  const sub =
    DATA.summary && DATA.summary.isActive ? DATA.summary.text : p.title || "";

  const meta = `
      <span><i class="fas fa-envelope"></i> ${p.email}</span>
      <span><i class="fas fa-phone"></i> ${p.phone}</span>
      <span><i class="fas fa-map-marker-alt"></i> ${p.location}</span>`;

  const links = (p.links || [])
    .map(
      (l) =>
        `<a class="btn-secondary" href="${l.url}" target="_blank"><i class="${iconClass(
          l.icon
        )}"></i> ${l.label}</a>`
    )
    .join("");

  $("hero-root").innerHTML = `
    <div class="hero">
      <div>
        <div class="hero-eyebrow">${p.title}</div>
        <h1>${heroName(p.name)}</h1>
        <p class="hero-sub">${sub}</p>
        <div class="hero-meta">${meta}</div>
        <div class="hero-actions">
          <a class="btn-primary" href="#contact">Get in touch</a>
          ${links}
        </div>
      </div>
      <div class="code-orbit">
        ${orbitHTML()}
        ${codeWindow(p)}
      </div>
    </div>`;
}

function orbitHTML() {
  const icons = [
    "fas fa-code",
    "fas fa-database",
    "fab fa-microsoft",
    "fab fa-angular",
    "fab fa-github",
    "fas fa-server",
    "fab fa-docker",
    "fas fa-cloud",
    "fas fa-code-branch",
  ];
  const step = 60 / icons.length;
  let out = `<div class="orbit-ring"></div>`;
  icons.forEach((ic, i) => {
    const d = (-step * i).toFixed(2);
    out += `<div class="orbit-dot" style="--d: ${d}s"><span class="orbit-icon" style="--d: ${d}s"><i class="${ic}"></i></span></div>`;
  });
  return out;
}

function codeWindow(p) {
  const links = (p.links || [])
    .map((l) => `    <span class="s">"${l.label}"</span>`)
    .join(",\n");
  return `<div class="code-window">
        <div class="code-window-bar">
          <span class="dot red"></span>
          <span class="dot yellow"></span>
          <span class="dot green"></span>
          <span class="fname">profile.json</span>
        </div>
        <pre><span class="p">{</span>
  <span class="k">"name"</span>: <span class="s">"${p.name}"</span>,
  <span class="k">"role"</span>: <span class="s">"${p.title}"</span>,
  <span class="k">"location"</span>: <span class="s">"${p.location}"</span>,
  <span class="k">"links"</span>: <span class="p">[</span>
${links}
  <span class="p">]</span>,
  <span class="k">"status"</span>: <span class="s">"open_to_work"</span> <span class="c">// always</span>
<span class="p">}</span></pre>
      </div>`;
}

/* ─── SUMMARY → About ─── */
function renderSummary(s) {
  if (!s || !s.isActive) return;
  const p = DATA.profile || {};
  const photo = p.photo
    ? `<img src="${p.photo}" alt="${p.name || ""}" class="about-photo" />`
    : "";
  const inner = `<div class="about-grid reveal">
      <div class="about-text"><p>${s.text || "Summary coming soon."}</p></div>
      <div class="about-stats">${photo}</div>
    </div>`;
  addSection("about", "About", inner, DATA.summary && DATA.summary.showInNav);
}

/* ─── EXPERIENCE → timeline ─── */
function renderExperience(e) {
  if (!e || !e.isActive) return;
  const items = withDummy(e.items, {
    title: "Position Title",
    company: "Company",
    period: "Year — Year",
    description: "Experience details coming soon.",
    links: [],
    tags: ["Tag"],
  })
    .map((it, i) => {
      const links = (it.links || [])
        .map(
          (l) =>
            `<a class="project-link" href="${l.url}" target="_blank">${l.label}</a>`
        )
        .join("");
      const tags = tagSpans(it.tags);
      return `<div class="tl-item${i === 0 ? " current" : ""}">
        <div class="tl-dot"></div>
        <div class="tl-date">${it.period}</div>
        <div class="tl-head">
          <div class="tl-logo-letter">${it.company.charAt(0)}</div>
          <div class="tl-title">${it.title}</div>
        </div>
        <div class="tl-org">${it.company}</div>
        <div class="tl-body">
          <p>${it.description}</p>
          ${tags ? `<div class="project-tags" style="margin-top:.6rem">${tags}</div>` : ""}
          ${links ? `<div class="project-links" style="padding-top:.6rem">${links}</div>` : ""}
        </div>
      </div>`;
    })
    .join("");
  addSection("experience", "Experience", `<div class="timeline reveal">${items}</div>`, e.showInNav);
}

/* ─── EDUCATION → edu-grid ─── */
function renderEducation(ed) {
  if (!ed || !ed.isActive) return;
  const items = withDummy(ed.items, {
    institution: "Institution",
    degree: "Degree",
    period: "Year — Year",
    details: "",
  })
    .map(
      (it) => `<div class="edu-card">
        <div class="edu-year-badge">${it.period}</div>
        <div class="edu-degree">${it.degree}</div>
        <div class="edu-inst">${it.institution}</div>
        ${it.details ? `<span class="edu-gpa">${it.details}</span>` : ""}
      </div>`
    )
    .join("");
  addSection("education", "Education", `<div class="edu-grid reveal">${items}</div>`, ed.showInNav);
}

/* ─── SKILLS → skills-grid ─── */
function renderSkills(sk) {
  if (!sk || !sk.isActive) return;
  const cards = withDummy(sk.categories, {
    label: "Category",
    items: ["Skill"],
  })
    .map((cat) => {
      let body;
      if (cat.platforms) {
        const chips = cat.platforms
          .map(
            (pl) =>
              `<a class="tech-chip" href="${pl.url}" target="_blank">${pl.name} · ${pl.rating}</a>`
          )
          .join("");
        body = `${cat.text ? `<div class="skill-items" style="margin-bottom:.6rem">${cat.text}</div>` : ""}<div class="tech-chips">${chips}</div>`;
      } else {
        const chips = (cat.items || [])
          .map((t) => `<span class="tech-chip">${t}</span>`)
          .join("");
        body = `<div class="tech-chips">${chips}</div>`;
      }
      return `<div class="skill-card"><div class="skill-label">${cat.label}</div>${body}</div>`;
    })
    .join("");
  addSection("skills", "Technical Skills", `<div class="skills-grid reveal">${cards}</div>`, sk.showInNav);
}

/* ─── COMPETITIVE PROGRAMMING → awards-list ─── */
function renderCompetitiveProgramming(cp) {
  if (!cp || !cp.isActive) return;
  const items = withDummy(cp.items, {
    title: "Achievement",
    result: "Details coming soon.",
  })
    .map(
      (it) => `<div class="award-card">
        <div class="award-icon"><i class="fas fa-trophy"></i></div>
        <div>
          <div class="award-title">${it.title}</div>
          <div class="award-desc">${it.result}</div>
        </div>
      </div>`
    )
    .join("");
  addSection("competitive", "Competitive Programming", `<div class="awards-list reveal">${items}</div>`, cp.showInNav);
}

/* ─── LEADERSHIP → timeline ─── */
function renderLeadership(ld) {
  if (!ld || !ld.isActive) return;
  const items = withDummy(ld.items, {
    title: "Role",
    organization: "Organization",
    period: "Year — Year",
    description: "Details coming soon.",
  })
    .map(
      (it) => `<div class="tl-item">
        <div class="tl-dot"></div>
        <div class="tl-date">${it.period}</div>
        <div class="tl-head">
          <div class="tl-logo-letter">${it.organization.charAt(0)}</div>
          <div class="tl-title">${it.title}</div>
        </div>
        <div class="tl-org">${it.organization}</div>
        <div class="tl-body"><p>${it.description}</p></div>
      </div>`
    )
    .join("");
  addSection("leadership", "Leadership &amp; Involvement", `<div class="timeline reveal">${items}</div>`, ld.showInNav);
}

/* ─── PROJECTS → projects-grid ─── */
function renderProjects(pr) {
  if (!pr || !pr.isActive) return;
  const cards = withDummy(pr.items, {
    title: "Project Title",
    link: "",
    linkLabel: "GitHub",
    description: "Project details coming soon.",
    tags: ["Tag"],
  })
    .map(
      (it) => `<div class="project-card reveal">
        <div class="project-title">${it.title}</div>
        <p class="project-desc">${it.description}</p>
        <div class="project-tags">${tagSpans(it.tags)}</div>
        <div class="project-links">
          ${it.link ? `<a class="project-link" href="${it.link}" target="_blank">${it.linkLabel || "GitHub"}</a>` : ""}
        </div>
      </div>`
    )
    .join("");
  addSection("projects", "Projects", `<div class="projects-grid">${cards}</div>`, pr.showInNav);
}

/* ─── AWARDS → awards-list (strings) ─── */
function renderAwards(aw) {
  if (!aw || !aw.isActive) return;
  const items = withDummy(aw.items, "Award coming soon.")
    .map(
      (a) => `<div class="award-card">
        <div class="award-icon"><i class="fas fa-star"></i></div>
        <div><div class="award-title">${a}</div></div>
      </div>`
    )
    .join("");
  addSection("awards", "Honors &amp; Awards", `<div class="awards-list reveal">${items}</div>`, aw.showInNav);
}

/* ─── CERTIFICATIONS → edu-grid ─── */
function renderCertifications(c) {
  if (!c || !c.isActive) return;
  const items = withDummy(c.items, {
    title: "Certification",
    issuer: "Issuer",
    year: "",
  })
    .map(
      (it) => `<div class="edu-card">
        ${it.year ? `<div class="edu-year-badge">${it.year}</div>` : ""}
        <div class="edu-degree">${it.title || it.name || ""}</div>
        <div class="edu-inst">${it.issuer || it.org || ""}</div>
      </div>`
    )
    .join("");
  addSection("certifications", "Certifications", `<div class="edu-grid reveal">${items}</div>`, c.showInNav);
}

/* ─── SEMINARS → awards-list ─── */
function renderSeminars(s) {
  if (!s || !s.isActive) return;
  const items = withDummy(s.items, { title: "Seminar", detail: "" })
    .map(
      (it) => `<div class="award-card">
        <div class="award-icon"><i class="fas fa-chalkboard-user"></i></div>
        <div>
          <div class="award-title">${it.title || it}</div>
          ${it.detail ? `<div class="award-desc">${it.detail}</div>` : ""}
        </div>
      </div>`
    )
    .join("");
  addSection("seminars", "Seminars &amp; Workshops", `<div class="awards-list reveal">${items}</div>`, s.showInNav);
}

/* ─── CONTACT → form section (footer built separately) ─── */
function renderContact(c) {
  if (!c || !c.isActive) return;
  const field =
    "width:100%;padding:11px 14px;border:1px solid var(--hairline);border-radius:var(--r-md);background:var(--canvas);color:var(--ink);font-family:var(--body-font);font-size:.9rem";
  const form = `<div class="reveal contact-layout">
      <div class="contact-copy">
        <p class="contact-intro">
          Have a project in mind or want to collaborate? Send a message and I'll get back to you.
        </p>
        <div class="hero-meta">
          <span><i class="fas fa-envelope"></i> ${c.email}</span>
          <span><i class="fas fa-phone"></i> ${c.phone}</span>
          <span><i class="fas fa-map-marker-alt"></i> ${c.location}</span>
        </div>
      </div>
      <form id="contact-form" class="contact-form">
        <input name="from_name" type="text" required placeholder="Name" style="${field}" />
        <input name="from_email" type="email" required placeholder="Email" style="${field}" />
        <input name="subject" type="text" required placeholder="Subject" style="${field}" />
        <textarea name="message" rows="5" required placeholder="Message" style="${field};resize:vertical"></textarea>
        <button type="submit" id="send-btn" class="btn-primary contact-submit">Send Message</button>
        <p id="form-status" class="contact-status"></p>
      </form>
    </div>`;
  addSection("contact", "Contact", form, c.showInNav);
}

/* ─── NAV bar (from active sections) ─── */
function renderNav() {
  const links = NAV.map((n) => `<li><a href="#${n.id}">${n.label}</a></li>`).join("");
  $("nav-links").innerHTML = links;
  $("nav-links-mobile").innerHTML = links;
}

/* ─── FOOTER ─── */
function buildFooter(c) {
  const p = DATA.profile || {};
  const initial = (p.name || "?").trim().charAt(0);
  const profiles = (p.links || [])
    .map((l) => `<a href="${l.url}" target="_blank">${l.label}</a>`)
    .join("");
  const sections = NAV.map((n) => `<a href="#${n.id}">${n.label}</a>`).join("");
  const tag = DATA.summary && DATA.summary.isActive ? DATA.summary.text : "";
  const ct = c || {};
  $("footer-root").innerHTML = `<div class="footer-inner">
      <div class="footer-top">
        <div>
          <div class="footer-name"><span class="logo-mark">${initial}</span> ${p.name || ""}</div>
          <p class="footer-tag">${tag}</p>
        </div>
        <div class="footer-links">
          <div class="footer-col">
            <h4>Contact</h4>
            ${ct.email ? `<a href="mailto:${ct.email}">${ct.email}</a>` : ""}
            ${ct.phone ? `<a href="tel:${ct.phone}">${ct.phone}</a>` : ""}
            ${ct.location ? `<a href="#contact">${ct.location}</a>` : ""}
          </div>
          <div class="footer-col"><h4>Profiles</h4>${profiles}</div>
          <div class="footer-col"><h4>Sections</h4>${sections}</div>
        </div>
      </div>
      <div class="footer-bottom">
        <span>© 2026 ${p.name || ""}</span>
        <span>Designed &amp; built with care</span>
      </div>
    </div>`;
}

/* ─── INTERACTIONS (run after content injected) ─── */
function initInteractions() {
  const bar = $("progress");
  const onScrollBar = () => {
    const h = document.documentElement;
    bar.style.width = (h.scrollTop / (h.scrollHeight - h.clientHeight)) * 100 + "%";
  };
  window.addEventListener("scroll", onScrollBar, { passive: true });

  const topBtn = $("top-btn");
  window.addEventListener(
    "scroll",
    () => topBtn.classList.toggle("show", scrollY > 400),
    { passive: true }
  );

  const revealObs = new IntersectionObserver(
    (entries) => {
      entries.forEach((e, i) => {
        if (e.isIntersecting) {
          setTimeout(() => e.target.classList.add("visible"), i * 55);
          revealObs.unobserve(e.target);
        }
      });
    },
    { threshold: 0.07, rootMargin: "0px 0px -36px 0px" }
  );
  document.querySelectorAll(".reveal").forEach((el) => revealObs.observe(el));

  const navLinks = document.querySelectorAll(".nav-links a, .nav-links-mobile a");
  const navObs = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          navLinks.forEach((l) => l.classList.remove("active"));
          document
            .querySelectorAll(
              `.nav-links a[href="#${e.target.id}"], .nav-links-mobile a[href="#${e.target.id}"]`
            )
            .forEach((a) => a.classList.add("active"));
        }
      });
    },
    { rootMargin: "-40% 0px -55% 0px" }
  );
  document.querySelectorAll("section[id]").forEach((s) => navObs.observe(s));

  const navToggle = $("nav-toggle");
  const navMobile = $("nav-links-mobile");
  navToggle.addEventListener("click", () => {
    navMobile.classList.toggle("open");
    navToggle.innerHTML = navMobile.classList.contains("open")
      ? '<i class="fas fa-xmark"></i>'
      : '<i class="fas fa-bars"></i>';
  });
  navMobile.querySelectorAll("a").forEach((a) => {
    a.addEventListener("click", () => {
      navMobile.classList.remove("open");
      navToggle.innerHTML = '<i class="fas fa-bars"></i>';
    });
  });

  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const t = document.querySelector(a.getAttribute("href"));
      if (t) {
        e.preventDefault();
        t.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });
}

/* ─── CONTACT FORM (EmailJS) ─── */
function initContactForm(contactData) {
  if (!contactData || !contactData.isActive) return;
  if (typeof emailjs === "undefined") return;

  emailjs.init(contactData.form.publicKey);

  const form = $("contact-form");
  const btn = $("send-btn");
  const status = $("form-status");
  if (!form) return;

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    btn.disabled = true;
    btn.textContent = "Sending...";
    status.textContent = "";

    emailjs
      .send(contactData.form.serviceId, contactData.form.templateId, {
        name: form.from_name.value,
        email: form.from_email.value,
        from_name: form.from_name.value,
        from_email: form.from_email.value,
        reply_to: form.from_email.value,
        to_email: contactData.email,
        subject: form.subject.value,
        message: form.message.value,
      })
      .then(() => {
        status.textContent = "Message sent successfully!";
        status.style.color = "green";
        form.reset();
      })
      .catch((err) => {
        status.textContent = "Failed to send. Please try again.";
        status.style.color = "red";
        console.error(err);
      })
      .finally(() => {
        btn.disabled = false;
        btn.textContent = "Send Message";
      });
  });
}
