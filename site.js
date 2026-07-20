const templates = [
  {
    id: "nextjs-app",
    name: "Next.js App",
    role: "base",
    category: "Web",
    description: "Runnable Next.js TypeScript web application starter.",
    provides: ["web", "node", "typescript", "react", "containerizable", "app-runtime"],
    requires: [],
    conflicts: [],
    tags: ["web", "nextjs", "typescript", "react"]
  },
  {
    id: "react-spa",
    name: "React SPA",
    role: "base",
    category: "Web",
    description: "Runnable React TypeScript single-page application starter.",
    provides: ["web", "node", "typescript", "react", "app-runtime"],
    requires: [],
    conflicts: [],
    tags: ["web", "react", "vite", "typescript"]
  },
  {
    id: "fastapi-service",
    name: "FastAPI Service",
    role: "base",
    category: "Software",
    description: "Runnable Python FastAPI service starter with health endpoint.",
    provides: ["api", "python", "containerizable", "app-runtime"],
    requires: [],
    conflicts: [],
    tags: ["api", "python", "fastapi"]
  },
  {
    id: "node-cli",
    name: "Node CLI",
    role: "base",
    category: "Software",
    description: "Runnable TypeScript command-line application starter.",
    provides: ["cli", "node", "typescript", "app-runtime"],
    requires: [],
    conflicts: [],
    tags: ["cli", "node", "typescript"]
  },
  {
    id: "react-native-app",
    name: "React Native App",
    role: "base",
    category: "Mobile",
    description: "Runnable Expo-style React Native mobile application starter.",
    provides: ["mobile", "node", "typescript", "react", "containerizable", "app-runtime"],
    requires: [],
    conflicts: [],
    tags: ["mobile", "react-native", "expo", "typescript"]
  },
  {
    id: "unity-game",
    name: "Unity Game",
    role: "base",
    category: "Game Development",
    description: "Unity game workspace starter with folders, docs, and placeholder scripts.",
    provides: ["game", "unity", "csharp", "game-workspace", "containerizable"],
    requires: [],
    conflicts: [],
    tags: ["game", "unity", "csharp"]
  },
  {
    id: "godot-game",
    name: "Godot Game",
    role: "base",
    category: "Game Development",
    description: "Godot game starter with scene, script, docs, and export checklist.",
    provides: ["game", "godot", "gdscript", "game-workspace", "containerizable"],
    requires: [],
    conflicts: [],
    tags: ["game", "godot", "gdscript"]
  },
  {
    id: "project-genesis",
    name: "Project Genesis",
    role: "base",
    category: "Project Scaffolding",
    description: "Reference template for the Project Genesis Architect and Builder workflow.",
    provides: ["typescript", "template-generation", "cli"],
    requires: [],
    conflicts: [],
    tags: ["ai", "docs", "planning"]
  },
  {
    id: "feature-docker",
    name: "Docker Support",
    role: "feature",
    category: "Infrastructure",
    description: "Container files and Docker usage notes.",
    provides: ["docker"],
    requires: ["containerizable"],
    conflicts: [],
    tags: ["docker", "containers"]
  },
  {
    id: "feature-github-actions",
    name: "GitHub Actions CI",
    role: "feature",
    category: "Tooling",
    description: "Continuous integration workflow scaffold.",
    provides: ["ci"],
    requires: [],
    conflicts: [],
    tags: ["github-actions", "ci"]
  },
  {
    id: "feature-postgresql",
    name: "PostgreSQL",
    role: "feature",
    category: "Database",
    description: "PostgreSQL docs, environment example, and migration folder.",
    provides: ["postgres", "database"],
    requires: [],
    conflicts: ["sqlite"],
    tags: ["database", "postgresql"]
  },
  {
    id: "feature-sqlite",
    name: "SQLite",
    role: "feature",
    category: "Database",
    description: "SQLite docs and data folder scaffold.",
    provides: ["sqlite", "database"],
    requires: [],
    conflicts: ["postgres"],
    tags: ["database", "sqlite"]
  },
  {
    id: "feature-playwright",
    name: "Playwright E2E",
    role: "feature",
    category: "Testing",
    description: "Playwright end-to-end test scaffold.",
    provides: ["e2e-testing"],
    requires: ["web", "node"],
    conflicts: [],
    tags: ["testing", "playwright", "e2e"]
  },
  {
    id: "feature-pytest",
    name: "Pytest",
    role: "feature",
    category: "Testing",
    description: "Python pytest scaffold.",
    provides: ["python-testing"],
    requires: ["python"],
    conflicts: [],
    tags: ["testing", "pytest", "python"]
  },
  {
    id: "feature-auth",
    name: "Authentication Planning",
    role: "feature",
    category: "Security",
    description: "Authentication docs, env placeholders, and protected-route notes.",
    provides: ["auth"],
    requires: ["app-runtime"],
    conflicts: [],
    tags: ["auth", "security"]
  },
  {
    id: "feature-tailwind",
    name: "Tailwind Styling",
    role: "feature",
    category: "Styling",
    description: "Tailwind styling scaffold and notes.",
    provides: ["tailwind"],
    requires: ["web"],
    conflicts: [],
    tags: ["tailwind", "css", "styling"]
  },
  {
    id: "feature-mobile-navigation",
    name: "Mobile Navigation",
    role: "feature",
    category: "Mobile",
    description: "Mobile screen navigation scaffold.",
    provides: ["mobile-navigation"],
    requires: ["mobile"],
    conflicts: [],
    tags: ["mobile", "navigation"]
  },
  {
    id: "feature-game-design-docs",
    name: "Game Design Docs",
    role: "feature",
    category: "Game Development",
    description: "Game design, mechanics, asset pipeline, and sprint planning docs.",
    provides: ["game-design-docs"],
    requires: ["game"],
    conflicts: [],
    tags: ["game", "docs", "design"]
  },
  {
    id: "feature-ai-workspace",
    name: "AI Workspace",
    role: "feature",
    category: "Documentation",
    description: "AI collaboration docs and planning workspace.",
    provides: ["ai-workspace"],
    requires: [],
    conflicts: [],
    tags: ["ai", "docs", "planning"]
  }
];

const profiles = [
  {
    id: "web-saas-starter",
    name: "Web SaaS Starter",
    category: "Web",
    description: "Next.js SaaS starter with Tailwind, PostgreSQL, auth planning, Playwright, CI, and AI workspace docs.",
    base: "nextjs-app",
    features: ["feature-tailwind", "feature-postgresql", "feature-auth", "feature-playwright", "feature-github-actions", "feature-ai-workspace"]
  },
  {
    id: "marketing-web-app",
    name: "Marketing Web App",
    category: "Web",
    description: "Next.js marketing starter with Tailwind, GitHub Actions, and AI workspace guidance.",
    base: "nextjs-app",
    features: ["feature-tailwind", "feature-github-actions", "feature-ai-workspace"]
  },
  {
    id: "frontend-dashboard",
    name: "Frontend Dashboard",
    category: "Web",
    description: "React SPA dashboard starter with Tailwind, Playwright, CI, and AI workflow docs.",
    base: "react-spa",
    features: ["feature-tailwind", "feature-playwright", "feature-github-actions", "feature-ai-workspace"]
  },
  {
    id: "api-service",
    name: "API Service",
    category: "Software",
    description: "FastAPI service with PostgreSQL, Pytest, Docker, GitHub Actions, and AI workspace docs.",
    base: "fastapi-service",
    features: ["feature-postgresql", "feature-pytest", "feature-docker", "feature-github-actions", "feature-ai-workspace"]
  },
  {
    id: "developer-cli",
    name: "Developer CLI",
    category: "Software",
    description: "TypeScript Node CLI starter with GitHub Actions and AI workspace documentation.",
    base: "node-cli",
    features: ["feature-github-actions", "feature-ai-workspace"]
  },
  {
    id: "mobile-app",
    name: "Mobile App",
    category: "Mobile",
    description: "Expo-style React Native starter with mobile navigation, CI, and AI workspace docs.",
    base: "react-native-app",
    features: ["feature-mobile-navigation", "feature-github-actions", "feature-ai-workspace"]
  },
  {
    id: "unity-game-jam",
    name: "Unity Game Jam",
    category: "Game",
    description: "Unity workspace with game design docs, GitHub Actions, and AI planning files.",
    base: "unity-game",
    features: ["feature-game-design-docs", "feature-github-actions", "feature-ai-workspace"]
  },
  {
    id: "godot-indie-game",
    name: "Godot Indie Game",
    category: "Game",
    description: "Godot starter with game design docs, CI, and AI planning workspace.",
    base: "godot-game",
    features: ["feature-game-design-docs", "feature-github-actions", "feature-ai-workspace"]
  }
];

const templateGrid = document.querySelector("#templateGrid");
const profileGrid = document.querySelector("#profileGrid");
const searchInput = document.querySelector("#templateSearch");
const roleFilter = document.querySelector("#roleFilter");
const categoryFilter = document.querySelector("#categoryFilter");

function tag(text, className = "") {
  return `<span class="tag ${className}">${text}</span>`;
}

function renderTemplateCard(template) {
  const capabilityTags = template.provides.slice(0, 5).map((item) => tag(item)).join("");
  const required = template.requires.length ? template.requires.join(", ") : "None";
  const conflicts = template.conflicts.length ? template.conflicts.map((item) => tag(item, "conflict")).join("") : tag("none");

  return `
    <article class="card">
      <div class="card-header">
        <div>
          <h3>${template.name}</h3>
          <p>${template.description}</p>
        </div>
        ${tag(template.role, template.role)}
      </div>
      <div class="tag-row">${capabilityTags}</div>
      <div class="meta-list">
        <span><strong>ID:</strong> ${template.id}</span>
        <span><strong>Category:</strong> ${template.category}</span>
        <span><strong>Requires:</strong> ${required}</span>
        <span><strong>Conflicts:</strong> ${conflicts}</span>
      </div>
    </article>
  `;
}

function renderProfileCard(profile) {
  const features = profile.features.map((item) => tag(item)).join("");

  return `
    <article class="card">
      <div class="card-header">
        <div>
          <h3>${profile.name}</h3>
          <p>${profile.description}</p>
        </div>
        ${tag(profile.category)}
      </div>
      <div class="meta-list">
        <span><strong>ID:</strong> ${profile.id}</span>
        <span><strong>Base:</strong> ${profile.base}</span>
      </div>
      <div class="tag-row">${features}</div>
    </article>
  `;
}

function templateMatches(template, query) {
  const haystack = [
    template.id,
    template.name,
    template.category,
    template.description,
    template.role,
    ...template.tags,
    ...template.provides,
    ...template.requires,
    ...template.conflicts
  ].join(" ").toLowerCase();

  return haystack.includes(query);
}

function renderTemplates() {
  const query = searchInput.value.trim().toLowerCase();
  const role = roleFilter.value;
  const category = categoryFilter.value;

  const filtered = templates.filter((template) => {
    const roleOk = role === "all" || template.role === role;
    const categoryOk = category === "all" || template.category === category;
    const queryOk = !query || templateMatches(template, query);
    return roleOk && categoryOk && queryOk;
  });

  templateGrid.innerHTML = filtered.length
    ? filtered.map(renderTemplateCard).join("")
    : `<article class="panel"><h3>No templates found</h3><p>Try a broader search or reset the filters.</p></article>`;
}

function renderProfiles() {
  profileGrid.innerHTML = profiles.map(renderProfileCard).join("");
}

function populateCategories() {
  const categories = [...new Set(templates.map((template) => template.category))].sort();
  categoryFilter.insertAdjacentHTML(
    "beforeend",
    categories.map((category) => `<option value="${category}">${category}</option>`).join("")
  );
}

populateCategories();
renderTemplates();
renderProfiles();

searchInput.addEventListener("input", renderTemplates);
roleFilter.addEventListener("change", renderTemplates);
categoryFilter.addEventListener("change", renderTemplates);
