const navToggle = document.querySelector(".nav-toggle");
const siteNav = document.querySelector(".site-nav");
const navLinks = document.querySelectorAll(".nav-link");
const revealItems = document.querySelectorAll(".reveal");
const sections = document.querySelectorAll("main section[id]");
const lightbox = document.getElementById("lightbox");
const lightboxImage = document.getElementById("lightbox-image");
const lightboxCaption = document.getElementById("lightbox-caption");
const lightboxClose = document.querySelector(".lightbox-close");
const mediaTriggers = document.querySelectorAll("[data-full]");
const referenceTrack = document.querySelector("[data-reference-track]");
const slideButtons = document.querySelectorAll("[data-slide]");
const certificateTrack = document.querySelector("[data-certificate-track]");
const certificateSlideButtons = document.querySelectorAll("[data-cert-slide]");
const projectGrid = document.getElementById("project-grid");
const projectModal = document.getElementById("project-modal");
const projectModalTitle = document.getElementById("project-modal-title");
const projectModalDescription = document.getElementById("project-modal-description");
const projectModalClose = document.querySelector(".project-modal-close");
const projectGalleryImage = document.getElementById("project-gallery-image");
const projectGalleryCounter = document.getElementById("project-gallery-counter");
const projectGalleryThumbs = document.getElementById("project-gallery-thumbs");
const projectGalleryOpen = document.getElementById("project-gallery-open");
const projectNavButtons = document.querySelectorAll("[data-project-nav]");

if (!Array.isArray(projects)) {
  throw new Error("projects-data.js must be loaded before script.js");
}

let activeProjectIndex = 0;
let activeProjectImageIndex = 0;

if (navToggle && siteNav) {
  navToggle.addEventListener("click", () => {
    const expanded = navToggle.getAttribute("aria-expanded") === "true";
    navToggle.setAttribute("aria-expanded", String(!expanded));
    siteNav.classList.toggle("open");
  });
}

navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    if (siteNav?.classList.contains("open")) {
      siteNav.classList.remove("open");
      navToggle?.setAttribute("aria-expanded", "false");
    }
  });
});

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.18 }
);

revealItems.forEach((item) => revealObserver.observe(item));

const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) {
        return;
      }

      navLinks.forEach((link) => {
        const isMatch = link.getAttribute("href") === `#${entry.target.id}`;
        link.classList.toggle("active", isMatch);
      });
    });
  },
  {
    rootMargin: "-35% 0px -45% 0px",
    threshold: 0.05,
  }
);

sections.forEach((section) => sectionObserver.observe(section));

const renderProjects = () => {
  if (!projectGrid) {
    return;
  }

  projectGrid.innerHTML = projects
    .map(
      (project, index) => `
        <article class="project-card reveal" data-project-index="${index}" role="button" tabindex="0" aria-label="Отвори ${project.title}">
          <div class="project-visual">
            <img src="${project.cover}" alt="${project.title}" />
          </div>
          <div class="project-body">
            <h3>${project.title}</h3>
            <p>${project.description[0]}</p>
            <span class="project-link">Виж проекта</span>
          </div>
        </article>
      `
    )
    .join("");

  projectGrid.querySelectorAll(".project-card").forEach((card) => {
    revealObserver.observe(card);
    card.addEventListener("click", () => openProjectModal(Number(card.dataset.projectIndex)));
    card.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openProjectModal(Number(card.dataset.projectIndex));
      }
    });
  });
};

const renderProjectGallery = () => {
  const project = projects[activeProjectIndex];
  const image = project.images[activeProjectImageIndex];

  projectGalleryImage.src = image;
  projectGalleryImage.alt = project.title;
  projectGalleryCounter.textContent = `${activeProjectImageIndex + 1} / ${project.images.length}`;
  projectGalleryThumbs.innerHTML = project.images
    .map(
      (src, index) => `
        <button class="project-thumb ${index === activeProjectImageIndex ? "active" : ""}" type="button" data-project-thumb="${index}" aria-label="Снимка ${index + 1}">
          <img src="${src}" alt="${project.title} - снимка ${index + 1}" />
        </button>
      `
    )
    .join("");

  projectGalleryThumbs.querySelectorAll(".project-thumb").forEach((thumb) => {
    thumb.addEventListener("click", () => {
      activeProjectImageIndex = Number(thumb.dataset.projectThumb);
      renderProjectGallery();
    });
  });
};

const openProjectModal = (index) => {
  const project = projects[index];
  activeProjectIndex = index;
  activeProjectImageIndex = 0;
  projectModalTitle.textContent = project.title;
  projectModalDescription.innerHTML = project.description.map((paragraph) => `<p>${paragraph}</p>`).join("");
  renderProjectGallery();
  projectModal.classList.add("open");
  projectModal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
};

const closeProjectModal = () => {
  projectModal.classList.remove("open");
  projectModal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = lightbox.classList.contains("open") ? "hidden" : "";
};

const openLightbox = (src, title) => {
  lightboxImage.src = src;
  lightboxImage.alt = title;
  lightboxCaption.textContent = title;
  lightbox.classList.add("open");
  lightbox.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
};

const closeLightbox = () => {
  lightbox.classList.remove("open");
  lightbox.setAttribute("aria-hidden", "true");
  lightboxImage.src = "";
  document.body.style.overflow = projectModal.classList.contains("open") ? "hidden" : "";
};

mediaTriggers.forEach((trigger) => {
  trigger.addEventListener("click", () => {
    openLightbox(trigger.dataset.full, trigger.dataset.title || "Преглед");
  });
});

lightboxClose?.addEventListener("click", closeLightbox);

lightbox?.addEventListener("click", (event) => {
  if (event.target === lightbox) {
    closeLightbox();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && lightbox.classList.contains("open")) {
    closeLightbox();
  }

  if (event.key === "Escape" && projectModal.classList.contains("open")) {
    closeProjectModal();
  }
});

slideButtons.forEach((button) => {
  button.addEventListener("click", () => {
    if (!referenceTrack) {
      return;
    }

    const direction = button.dataset.slide === "next" ? 1 : -1;
    const distance = Math.min(referenceTrack.clientWidth * 0.85, 700);
    referenceTrack.scrollBy({ left: distance * direction, behavior: "smooth" });
  });
});

certificateSlideButtons.forEach((button) => {
  button.addEventListener("click", () => {
    if (!certificateTrack) {
      return;
    }

    const direction = button.dataset.certSlide === "next" ? 1 : -1;
    const card = certificateTrack.querySelector(".certificate-card");
    const gap = 18;
    const distance = card ? card.clientWidth * 3 + gap * 2 : certificateTrack.clientWidth * 0.9;
    certificateTrack.scrollBy({ left: distance * direction, behavior: "smooth" });
  });
});

projectModalClose?.addEventListener("click", closeProjectModal);

projectModal?.addEventListener("click", (event) => {
  if (event.target === projectModal) {
    closeProjectModal();
  }
});

projectNavButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const project = projects[activeProjectIndex];
    const step = button.dataset.projectNav === "next" ? 1 : -1;
    activeProjectImageIndex = (activeProjectImageIndex + step + project.images.length) % project.images.length;
    renderProjectGallery();
  });
});

projectGalleryOpen?.addEventListener("click", () => {
  const project = projects[activeProjectIndex];
  openLightbox(project.images[activeProjectImageIndex], `${project.title} - снимка ${activeProjectImageIndex + 1}`);
});

renderProjects();
