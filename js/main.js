const navToggle = document.querySelector('.nav-toggle');
const nav = document.querySelector('.nav');
const navPanel = nav ? nav.querySelector('.nav-panel') : null;
const headerPill = document.querySelector('.header-pill');
const topbar = document.querySelector('[data-audience-header]') || document.querySelector('.topbar');
const audienceSwitch = document.querySelector('[data-audience-switch]');
const audienceButtons = audienceSwitch ? Array.from(audienceSwitch.querySelectorAll('[data-audience-btn]')) : [];
const headerMenu = document.querySelector('[data-header-menu]');
const audienceStorageKey = 'te_selected_audience';

/* HEADER FIX: NEUTRAL DEFAULT (NO PERSISTENCE) */

const pathname = window.location.pathname.toLowerCase();
const onIndexPage = pathname.endsWith('/') || pathname.endsWith('/index.html');
const onLegalPage =
  pathname.endsWith('/datenschutzerklaerung') ||
  pathname.endsWith('/datenschutzerklaerung.html') ||
  pathname.endsWith('/impressum') ||
  pathname.endsWith('/impressum.html');
const onCompaniesPage =
  pathname.endsWith('/unternehmen') ||
  pathname.endsWith('/unternehmen.html') ||
  pathname.endsWith('/kontakt') ||
  pathname.endsWith('/kontakt.html') ||
  pathname.endsWith('/leistungen') ||
  pathname.endsWith('/leistungen.html') ||
  pathname.endsWith('/services') ||
  pathname.endsWith('/services.html');
const onStudentsPage =
  onIndexPage ||
  pathname.endsWith('/anmeldung') ||
  pathname.endsWith('/anmeldung.html') ||
  pathname.endsWith('/ueber-uns') ||
  pathname.endsWith('/ueber-uns.html') ||
  pathname.endsWith('/talent-elevator-2023') ||
  pathname.endsWith('/talent-elevator-2023.html') ||
  pathname.endsWith('/talent-elevator-2024') ||
  pathname.endsWith('/talent-elevator-2024.html') ||
  pathname.endsWith('/talent-elevator-2025') ||
  pathname.endsWith('/talent-elevator-2025.html');

/* HEADER MENU ITEMS */
const audienceMenus = {
  students: [
    { label: 'Vergangene Events', href: onIndexPage ? '#vergangene-events' : 'talent-elevator-2025.html' },
    { label: 'Anmeldung', href: 'anmeldung.html' },
    { label: 'Über uns', href: 'ueber-uns.html' },
  ],
  companies: [
    { label: 'Unsere Leistungen', href: 'unternehmen.html' },
    { label: 'Kontakt', href: 'kontakt.html' },
  ],
};

const normalizeAudience = (value) => {
  if (value === 'students' || value === 'companies') {
    return value;
  }
  return '';
};

const readStoredAudience = () => {
  try {
    return normalizeAudience(window.localStorage.getItem(audienceStorageKey) || '');
  } catch (_error) {
    return '';
  }
};

const persistAudience = (audience) => {
  try {
    if (audience) {
      window.localStorage.setItem(audienceStorageKey, audience);
      return;
    }
    window.localStorage.removeItem(audienceStorageKey);
  } catch (_error) {
    // Ignore storage errors (e.g., private mode restrictions).
  }
};

const renderLinks = (container, links) => {
  if (!container) {
    return;
  }
  container.innerHTML = '';
  links.forEach((item) => {
    const link = document.createElement('a');
    link.href = item.href;
    link.textContent = item.label;
    const current = `${window.location.pathname}${window.location.hash}`.toLowerCase();
    const target = item.href.toLowerCase();
    if (current.endsWith(target) || (target.startsWith('#') && window.location.hash.toLowerCase() === target)) {
      link.classList.add('active');
    }
    container.appendChild(link);
  });
};

function setMenuState(isOpen) {
  /* MENU TOGGLE + OUTSIDE CLICK + ESC */
  if (!nav || !navToggle) {
    return;
  }

  if (isOpen && navPanel && headerPill) {
    const pillRect = headerPill.getBoundingClientRect();
    const pillStyles = window.getComputedStyle(headerPill);
    const maxWidth = Math.min(900, window.innerWidth - 24);
    const baseWidth = Math.min(860, maxWidth);
    const minWidth = Math.min(760, maxWidth);
    const panelWidth = Math.max(minWidth, baseWidth);
    const panelLeft = Math.min(Math.max(12, pillRect.left), window.innerWidth - panelWidth - 12);
    const panelTop = Math.max(10, pillRect.top - 4);

    navPanel.style.width = `${panelWidth}px`;
    navPanel.style.left = `${panelLeft}px`;
    navPanel.style.top = `${panelTop}px`;
    navPanel.style.borderTopLeftRadius = pillStyles.borderTopLeftRadius;
    navPanel.style.borderTopRightRadius = pillStyles.borderTopRightRadius;
    navPanel.style.borderBottomRightRadius = pillStyles.borderBottomRightRadius;
    navPanel.style.borderBottomLeftRadius = pillStyles.borderBottomLeftRadius;
  }

  nav.classList.toggle('open', isOpen);
  document.body.classList.toggle('menu-open', isOpen);
  nav.setAttribute('aria-hidden', String(!isOpen));
  navToggle.setAttribute('aria-expanded', String(isOpen));
}

/* HEADER FIX: REMOVE ICON */
const applyAudienceVisuals = (audience) => {
  const selected = audience === 'students' || audience === 'companies';
  if (topbar) {
    topbar.classList.toggle('audience-selected', selected);
  }

  audienceButtons.forEach((btn) => {
    btn.classList.toggle('is-active', btn.dataset.audienceBtn === audience);
  });
};

/* HEADER FIX: MENU ONLY AFTER CLICK */
const applyAudience = (audience, options = {}) => {
  const { persist = true } = options;
  const normalized = normalizeAudience(audience);

  applyAudienceVisuals(normalized);
  const links = normalized ? audienceMenus[normalized] || [] : [];
  renderLinks(headerMenu, links);

  if (persist) {
    persistAudience(normalized);
  }
};

if (audienceButtons.length > 0) {
  audienceButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const targetAudience = normalizeAudience(btn.dataset.audienceBtn);
      if (!targetAudience) {
        return;
      }

      if (targetAudience === 'students' && !onIndexPage) {
        persistAudience('students');
        window.location.href = 'index.html';
        return;
      }

      if (targetAudience === 'companies' && !onCompaniesPage) {
        persistAudience('companies');
        window.location.href = 'unternehmen.html';
        return;
      }

      applyAudience(targetAudience);
      setMenuState(false);
    });
  });
}

if (navToggle && nav) {
  setMenuState(false);
  navToggle.addEventListener('click', () => {
    setMenuState(!nav.classList.contains('open'));
  });
}

window.addEventListener('resize', () => {
  if (nav && nav.classList.contains('open')) {
    setMenuState(true);
  }
});

if (nav) {
  nav.addEventListener('click', (event) => {
    if (event.target === nav) {
      setMenuState(false);
      return;
    }

    const targetEl = event.target instanceof Element ? event.target : event.target.parentElement;

    if (targetEl && (targetEl.closest('.nav-close') || targetEl.closest('a'))) {
      setMenuState(false);
    }
  });
}

document.addEventListener('click', (event) => {
  const target =
    event.target instanceof Element
      ? event.target.closest(
          'a[href="#unternehmen-kontakt"], a[href="index.html#unternehmen-kontakt"]'
        )
      : null;
  if (!target) {
    return;
  }

  const href = target.getAttribute('href') || '';
  const hashIndex = href.indexOf('#');
  if (hashIndex < 0) {
    return;
  }
  const hash = href.slice(hashIndex);

  const section = document.querySelector(hash);
  if (!section) {
    return;
  }

  event.preventDefault();
  const header = document.querySelector('.header-wrap');
  const headerHeight = header ? header.getBoundingClientRect().height : 0;
  const offset = headerHeight + 24;
  const sectionTop = section.getBoundingClientRect().top + window.scrollY;

  window.scrollTo({
    top: Math.max(0, sectionTop - offset),
    behavior: 'smooth',
  });

  setMenuState(false);
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    setMenuState(false);
  }
});

const storedAudience = readStoredAudience();
const initialAudience = onIndexPage ? 'students' : onLegalPage ? '' : onCompaniesPage ? 'companies' : onStudentsPage ? 'students' : storedAudience;
if (onIndexPage) {
  persistAudience('students');
}
applyAudience(initialAudience, { persist: false });

const revealEls = document.querySelectorAll('.reveal');

if ('IntersectionObserver' in window && revealEls.length > 0) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.14,
    }
  );

  revealEls.forEach((el) => observer.observe(el));
} else {
  revealEls.forEach((el) => el.classList.add('visible'));
}

(() => {
  const faqList = document.querySelector('.faq-list');
  if (!faqList) {
    return;
  }

  const items = Array.from(faqList.querySelectorAll('.faq-item'));
  if (items.length === 0) {
    return;
  }

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let isAnimating = false;

  const updateSpotlight = () => {
    const activeItem = items.find((item) => item.classList.contains('is-open'));
    faqList.classList.toggle('has-active', Boolean(activeItem));

    items.forEach((item) => {
      item.classList.toggle('is-active', item === activeItem);
      item.classList.toggle('is-inactive', Boolean(activeItem) && item !== activeItem);
    });
  };

  const closeItem = (item) => {
    if (!item.classList.contains('is-open')) {
      return;
    }

    const answer = item.querySelector('.faq-answer');
    if (!answer) {
      item.classList.remove('is-open');
      item.open = false;
      return;
    }

    if (reduceMotion) {
      answer.style.maxHeight = '0px';
      item.classList.remove('is-open');
      item.open = false;
      return;
    }

    item.open = true;
    const currentHeight = answer.scrollHeight;
    answer.style.maxHeight = `${currentHeight}px`;
    void answer.offsetHeight;
    answer.style.maxHeight = '0px';
    item.classList.remove('is-open');

    const onEnd = (event) => {
      if (event.propertyName !== 'max-height') {
        return;
      }
      answer.removeEventListener('transitionend', onEnd);
      if (!item.classList.contains('is-open')) {
        item.open = false;
      }
      isAnimating = false;
      updateSpotlight();
    };

    answer.addEventListener('transitionend', onEnd);
  };

  const openItem = (item) => {
    const answer = item.querySelector('.faq-answer');
    if (!answer) {
      item.classList.add('is-open');
      item.open = true;
      return;
    }

    item.classList.add('is-open');
    item.open = true;

    if (reduceMotion) {
      answer.style.maxHeight = 'none';
      return;
    }

    answer.style.maxHeight = '0px';
    void answer.offsetHeight;
    answer.style.maxHeight = `${answer.scrollHeight}px`;

    const onEnd = (event) => {
      if (event.propertyName !== 'max-height') {
        return;
      }
      answer.removeEventListener('transitionend', onEnd);
      if (item.classList.contains('is-open')) {
        answer.style.maxHeight = 'none';
      }
      isAnimating = false;
      updateSpotlight();
    };

    answer.addEventListener('transitionend', onEnd);
  };

  items.forEach((item) => {
    const summary = item.querySelector('summary');
    const answer = item.querySelector('.faq-answer');

    if (!summary || !answer) {
      return;
    }

    if (item.open) {
      item.classList.add('is-open');
      answer.style.maxHeight = 'none';
    } else {
      item.classList.remove('is-open');
      answer.style.maxHeight = '0px';
    }

    summary.addEventListener('click', (event) => {
      event.preventDefault();
      if (isAnimating) {
        return;
      }
      isAnimating = !reduceMotion;

      const shouldOpen = !item.classList.contains('is-open');

      items.forEach((otherItem) => {
        if (otherItem !== item) {
          closeItem(otherItem);
        }
      });

      if (shouldOpen) {
        openItem(item);
      } else {
        closeItem(item);
      }

      if (reduceMotion) {
        isAnimating = false;
      }
      window.setTimeout(updateSpotlight, reduceMotion ? 0 : 40);
    });
  });

  window.addEventListener('resize', () => {
    items.forEach((item) => {
      if (!item.open) {
        return;
      }
      const answer = item.querySelector('.faq-answer');
      if (!answer) {
        return;
      }
      answer.style.maxHeight = 'none';
    });
  });

  updateSpotlight();
})();

(() => {
  const form = document.querySelector('[data-contact-form]');
  if (!form) {
    return;
  }

  const submitButton = form.querySelector('[data-contact-submit]');
  const feedback = form.querySelector('[data-contact-feedback]');
  const successModal = document.querySelector('[data-contact-success-modal]');
  const resetButton = document.querySelector('[data-contact-reset]');
  const modalCloseArea = document.querySelector('[data-contact-modal-close]');
  const fields = ['name', 'company', 'email', 'message']
    .map((name) => form.elements.namedItem(name))
    .filter(Boolean);

  let isSubmitting = false;

  const setFeedback = (message, type = 'error') => {
    if (!feedback) {
      return;
    }

    feedback.textContent = message;
    feedback.classList.toggle('is-success', type === 'success');
  };

  const setLoadingState = (loading) => {
    if (!submitButton) {
      return;
    }

    submitButton.disabled = loading;
    submitButton.classList.toggle('is-loading', loading);
    submitButton.setAttribute('aria-busy', String(loading));
  };

  const clearInvalidState = () => {
    fields.forEach((field) => field.classList.remove('is-invalid'));
  };

  const validateForm = () => {
    clearInvalidState();

    const values = {
      name: String(form.elements.namedItem('name')?.value || '').trim(),
      company: String(form.elements.namedItem('company')?.value || '').trim(),
      email: String(form.elements.namedItem('email')?.value || '').trim(),
      message: String(form.elements.namedItem('message')?.value || '').trim(),
    };

    const missingField = Object.entries(values).find(([, value]) => !value);
    if (missingField) {
      const field = form.elements.namedItem(missingField[0]);
      field?.classList.add('is-invalid');
      field?.focus();
      setFeedback('Bitte fuellen Sie alle Pflichtfelder aus.');
      return null;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(values.email)) {
      const emailField = form.elements.namedItem('email');
      emailField?.classList.add('is-invalid');
      emailField?.focus();
      setFeedback('Bitte geben Sie eine gueltige E-Mail-Adresse ein.');
      return null;
    }

    setFeedback('');
    return values;
  };

  const openSuccessModal = () => {
    if (!successModal) {
      return;
    }

    successModal.classList.add('is-visible');
    successModal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('contact-modal-open');
  };

  const closeSuccessModal = () => {
    if (!successModal) {
      return;
    }

    successModal.classList.remove('is-visible');
    successModal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('contact-modal-open');
  };

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (isSubmitting) {
      return;
    }

    const payload = validateForm();
    if (!payload) {
      return;
    }

    isSubmitting = true;
    setLoadingState(true);
    setFeedback('');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json().catch(() => ({
        success: false,
        error: 'Unerwartete Serverantwort.',
      }));

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Die Anfrage konnte nicht gesendet werden.');
      }

      openSuccessModal();
      setFeedback('Ihre Anfrage wurde erfolgreich versendet.', 'success');
    } catch (error) {
      setFeedback(error.message || 'Die Anfrage konnte aktuell nicht gesendet werden.');
    } finally {
      isSubmitting = false;
      setLoadingState(false);
    }
  });

  fields.forEach((field) => {
    field.addEventListener('input', () => {
      field.classList.remove('is-invalid');
      if (feedback?.textContent) {
        setFeedback('');
      }
    });
  });

  const resetFlow = () => {
    form.reset();
    clearInvalidState();
    setFeedback('');
    closeSuccessModal();
  };

  resetButton?.addEventListener('click', resetFlow);
  modalCloseArea?.addEventListener('click', resetFlow);

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && successModal?.classList.contains('is-visible')) {
      resetFlow();
    }
  });
})();

(() => {
  const processTimeline = document.querySelector('.company-process-timeline');
  if (!processTimeline) {
    return;
  }

  const processSection = processTimeline.closest('.company-process-section');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const revealProcessSection = () => {
    if (!processSection) {
      return;
    }
    processSection.classList.add('is-visible');
  };

  if (!processSection || reduceMotion || !('IntersectionObserver' in window)) {
    revealProcessSection();
    return;
  }

  const processObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          revealProcessSection();
          processObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.26 }
  );
  processObserver.observe(processSection);
})();

(() => {
  const statsRoot = document.querySelector('.unternehmen-page [data-company-kpis]');
  if (!statsRoot) {
    return;
  }

  const statEls = Array.from(statsRoot.querySelectorAll('strong[data-company-stat][data-stat-target]'));
  if (statEls.length === 0) {
    return;
  }

  const renderValue = (el, value) => {
    const kind = el.getAttribute('data-company-stat');
    if (kind === 'average') {
      const formatted = value.toFixed(2).replace('.', ',');
      el.textContent = `Ø ${formatted}`;
      return;
    }
    el.textContent = `${Math.round(value)}%`;
  };

  statEls.forEach((el) => renderValue(el, 0));

  const start = () => {
    if (statsRoot.dataset.counted === 'true') {
      return;
    }
    statsRoot.dataset.counted = 'true';

    const duration = 1800;
    const startedAt = performance.now();

    const tick = (now) => {
      const progress = Math.min(1, (now - startedAt) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);

      statEls.forEach((el) => {
        const target = Number.parseFloat(el.getAttribute('data-stat-target') || '0');
        if (!Number.isFinite(target)) {
          return;
        }
        renderValue(el, target * eased);
      });

      if (progress < 1) {
        window.requestAnimationFrame(tick);
      }
    };

    window.requestAnimationFrame(tick);
  };

  if (!('IntersectionObserver' in window)) {
    start();
    return;
  }

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          start();
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.34 }
  );

  io.observe(statsRoot);
})();

(() => {
  const overview = document.querySelector('[data-te-overview]');
  if (!overview) {
    return;
  }

  const play = () => overview.classList.add('play');

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    play();
    return;
  }

  if (!('IntersectionObserver' in window)) {
    play();
    return;
  }

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          play();
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.3 }
  );

  io.observe(overview);
})();

(() => {
  const dayflow = document.querySelector('[data-dayflow]');
  if (!dayflow) {
    return;
  }

  const steps = Array.from(dayflow.querySelectorAll('.dayflow-step'));
  if (steps.length === 0) {
    return;
  }

  const play = () => {
    dayflow.classList.add('play');
  };

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    play();
    steps.forEach((step) => {
      step.classList.add('is-visible', 'is-active');
    });
    return;
  }

  if (!('IntersectionObserver' in window)) {
    play();
    steps.forEach((step) => {
      step.classList.add('is-visible', 'is-active');
    });
    return;
  }

  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          play();
          sectionObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );

  sectionObserver.observe(dayflow);

  const stepObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible', 'is-active');
        } else {
          entry.target.classList.remove('is-active');
        }
      });
    },
    { threshold: 0.45, rootMargin: '-10% 0px -10% 0px' }
  );

  steps.forEach((step) => stepObserver.observe(step));
})();

(() => {
  const factsSection = document.querySelector('[data-facts-section]');
  const factsGraphic = document.querySelector('[data-facts-graphic]');
  if (!factsSection || !factsGraphic) {
    return;
  }

  const slides = Array.from(factsGraphic.querySelectorAll('.event-facts-slide'));
  if (slides.length === 0) {
    return;
  }

  const DURATION_MS = 1700;
  const HOLD_MS = 520;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let rafId = null;
  let holdTimer = null;
  let started = false;
  let activeIndex = 0;

  const kpis = slides
    .map((slide) => {
      const valueEl = slide.querySelector('.event-facts-value');
      const progressFill = slide.querySelector('.kpi-fill') || slide.querySelector('.event-facts-progress-fill');
      if (!valueEl || !progressFill) {
        return null;
      }
      return {
        valueEl,
        progressFill,
        target: Number.parseInt(slide.getAttribute('data-kpi-target') || '0', 10),
        suffix: slide.getAttribute('data-kpi-suffix') || '',
      };
    })
    .filter(Boolean);

  if (kpis.length === 0) {
    return;
  }

  const setValue = (kpi, value) => {
    kpi.valueEl.textContent = `${value}${kpi.suffix}`;
  };

  const setActiveSlide = (index) => {
    slides.forEach((slide, slideIndex) => {
      slide.classList.toggle('is-active', slideIndex === index);
    });
  };

  const resetKpi = (kpi) => {
    setValue(kpi, 0);
    kpi.progressFill.style.transform = 'scaleX(0)';
  };

  const finalizeKpi = (kpi) => {
    setValue(kpi, kpi.target);
    kpi.progressFill.style.transform = 'scaleX(1)';
  };

  const runSlide = (index) => {
    const kpi = kpis[index];
    if (!kpi) {
      return;
    }

    setActiveSlide(index);

    if (rafId) {
      window.cancelAnimationFrame(rafId);
      rafId = null;
    }
    if (holdTimer) {
      window.clearTimeout(holdTimer);
      holdTimer = null;
    }

    if (reduceMotion) {
      finalizeKpi(kpi);
      return;
    }

    resetKpi(kpi);

    const startedAt = performance.now();
    const step = (now) => {
      const progress = Math.min(1, (now - startedAt) / DURATION_MS);
      const eased = 1 - Math.pow(1 - progress, 3);

      const value = Math.round(kpi.target * eased);
      setValue(kpi, value);
      kpi.progressFill.style.transform = `scaleX(${progress})`;

      if (progress < 1) {
        rafId = window.requestAnimationFrame(step);
      } else {
        holdTimer = window.setTimeout(() => {
          activeIndex = (index + 1) % kpis.length;
          runSlide(activeIndex);
        }, HOLD_MS);
      }
    };

    rafId = window.requestAnimationFrame(step);
  };

  const start = () => {
    if (started) {
      return;
    }
    started = true;
    factsSection.classList.add('play');

    if (reduceMotion) {
      activeIndex = 0;
      setActiveSlide(activeIndex);
      finalizeKpi(kpis[activeIndex]);
      return;
    }

    kpis.forEach((kpi) => resetKpi(kpi));
    activeIndex = 0;
    runSlide(activeIndex);
  };

  if (!('IntersectionObserver' in window)) {
    start();
    return;
  }

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          start();
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.35 }
  );

  io.observe(factsSection);
})();


const animatedDonuts = document.querySelectorAll('[data-animate-once]');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const SVG_NS = 'http://www.w3.org/2000/svg';
const ROTATE_DEG = 90; // LINE ANCHOR FIX

const donutConfig = {
  // Reihenfolge / Zuordnung links-rechts hier anpassen
  fixedSides: {
    left: ['WIRTSCHAFT', 'ANDERE'],
    right: ['TECHNIK', 'NATURWISSENSCHAFTEN', 'RECHT', 'IT'],
  },
  // Slot-Y Positionen pro Seite hier anpassen
  slots: {
    left: [-118, 170],
    right: [-172, -66, 44, 158],
  },
  // Spalten-/Linienlayout hier anpassen
  columns: {
    leftTextX: -468,
    rightTextX: 468,
    leftInnerX: -225,
    rightInnerX: 225,
  },
  animation: {
    segmentStaggerMs: 200,
    labelStaggerMs: 120,
  },
};

const normalizeKey = (value) =>
  (value || '')
    .toUpperCase()
    .replace(/Ä/g, 'AE')
    .replace(/Ö/g, 'OE')
    .replace(/Ü/g, 'UE')
    .replace(/ß/g, 'SS')
    .replace(/[^A-Z0-9]/g, '');

const splitTitleLines = (title) => {
  const clean = (title || '').trim().toUpperCase();
  if (!clean) {
    return [];
  }

  if (normalizeKey(clean) === 'NATURWISSENSCHAFTEN') {
    return ['NATUR-', 'WISSENSCHAFTEN'];
  }

  return [clean];
};

const splitDescriptionLines = (text, maxChars) => {
  const source = (text || '').trim();
  if (!source) {
    return [];
  }

  const chunks = source.split(',').map((part) => part.trim()).filter(Boolean);
  const lines = [];

  chunks.forEach((chunk) => {
    const words = chunk.split(/\s+/);
    let line = '';
    words.forEach((word) => {
      const next = line ? `${line} ${word}` : word;
      if (next.length > maxChars && line) {
        lines.push(line);
        line = word;
      } else {
        line = next;
      }
    });
    if (line) {
      lines.push(line);
    }
  });

  return lines;
};

const createSvgText = (tagName, attrs = {}, text = '') => {
  const node = document.createElementNS(SVG_NS, tagName);
  Object.entries(attrs).forEach(([key, value]) => {
    node.setAttribute(key, String(value));
  });
  if (text) {
    node.textContent = text;
  }
  return node;
};

const pickAnchorForSide = (segment, side, targetY, cx, cy, ringEdgeR, rotateDeg) => {
  const rad = ((segment.midAngle + rotateDeg) * Math.PI) / 180; // LINE ANCHOR FIX
  return {
    anchorX: cx + Math.cos(rad) * ringEdgeR, // LINE ANCHOR FIX
    anchorY: cy + Math.sin(rad) * ringEdgeR, // LINE ANCHOR FIX
  };
};

const buildDonutGeometry = (root) => {
  const svg = root.querySelector('.donut-svg-stage');
  const arcs = Array.from(root.querySelectorAll('.arc'));
  const ringLayer = root.querySelector('.ring-layer');
  const leadersLayer = root.querySelector('.leaders-layer');
  const labelsLayer = root.querySelector('.labels-layer');
  const donutList = root.querySelector('.donut-list');

  if (!svg || arcs.length === 0 || !ringLayer || !leadersLayer || !labelsLayer || !donutList) {
    return null;
  }

  const cx = Number.parseFloat(arcs[0].getAttribute('cx'));
  const cy = Number.parseFloat(arcs[0].getAttribute('cy'));
  const r = Number.parseFloat(arcs[0].getAttribute('r'));
  const strokeWidth = Number.parseFloat(getComputedStyle(arcs[0]).strokeWidth) || 38;
  const C = 2 * Math.PI * r;
  ringLayer.setAttribute('transform', `rotate(${ROTATE_DEG} ${cx} ${cy})`); // LINE ANCHOR FIX

  const values = arcs.map((arc) => Math.max(0, Number.parseFloat(arc.dataset.value) || 0));
  const sum = values.reduce((acc, value) => acc + value, 0);

  if (sum <= 0) {
    return null;
  }

  let accLen = 0;
  const segments = arcs.map((arc, index) => {
    const color = arc.dataset.color || '#d9e4f0';
    const isLast = index === arcs.length - 1;
    const len = isLast ? C - accLen : (values[index] / sum) * C;
    const startLen = accLen;
    const offset = -startLen;

    const startAngle = -90 + (startLen / C) * 360;
    const sweep = (len / C) * 360;
    const midAngle = startAngle + sweep / 2;
    const rad = (midAngle * Math.PI) / 180;

    const ringEdgeR = r + strokeWidth / 2;
    arc.style.stroke = color;
    arc.style.strokeDasharray = `0 ${C}`;
    arc.style.strokeDashoffset = `${offset}`;
    arc.dataset.len = String(len);
    arc.dataset.c = String(C);
    arc.dataset.offset = String(offset);

    accLen += len;

    return {
      arc,
      title: arc.dataset.title || '',
      desc: arc.dataset.desc || '',
      key: normalizeKey(arc.dataset.title || ''),
      color,
      startAngle,
      sweep,
      midAngle,
    };
  });

  const segmentMap = new Map(segments.map((segment) => [segment.key, segment]));

  const fixedSlots = [];
  donutConfig.fixedSides.left.forEach((key, idx) => {
    const segment = segmentMap.get(normalizeKey(key));
    if (!segment) {
      return;
    }

    const slotY =
      donutConfig.slots.left[idx] ?? donutConfig.slots.left[donutConfig.slots.left.length - 1];
    const anchor = pickAnchorForSide(
      segment,
      'left',
      slotY,
      cx,
      cy,
      r + strokeWidth / 2,
      ROTATE_DEG
    );

    fixedSlots.push({
      ...segment,
      side: 'left',
      ...anchor,
      slotY,
    });
  });

  donutConfig.fixedSides.right.forEach((key, idx) => {
    const segment = segmentMap.get(normalizeKey(key));
    if (!segment) {
      return;
    }

    const slotY =
      donutConfig.slots.right[idx] ?? donutConfig.slots.right[donutConfig.slots.right.length - 1];
    const anchor = pickAnchorForSide(
      segment,
      'right',
      slotY,
      cx,
      cy,
      r + strokeWidth / 2,
      ROTATE_DEG
    );

    fixedSlots.push({
      ...segment,
      side: 'right',
      ...anchor,
      slotY,
    });
  });

  donutList.innerHTML = '';
  fixedSlots.forEach((segment) => {
    const li = document.createElement('li');
    li.style.setProperty('--bullet', segment.color);
    li.classList.add(`side-${segment.side}`);

    const body = document.createElement('div');
    const strong = document.createElement('strong');
    strong.textContent = segment.title;
    const span = document.createElement('span');
    span.textContent = segment.desc;

    body.append(strong, span);
    li.append(body);
    donutList.append(li);
  });

  leadersLayer.innerHTML = '';
  labelsLayer.innerHTML = '';

  fixedSlots.forEach((segment, index) => {
    const titleLines = splitTitleLines(segment.title);
    const descLines = splitDescriptionLines(segment.desc, 30);
    const titleLineHeight = 18;
    const descLineHeight = 14;

    const titleTop = segment.slotY - 24;
    const underlineY = titleTop + titleLines.length * titleLineHeight + 5;
    const descStartY = underlineY + 22;

    const textX =
      segment.side === 'left' ? donutConfig.columns.leftTextX : donutConfig.columns.rightTextX;
    const innerX =
      segment.side === 'left' ? donutConfig.columns.leftInnerX : donutConfig.columns.rightInnerX;
    const textAnchor = segment.side === 'left' ? 'start' : 'end';

    // Underline unter dem Titel + Knick (elbow) zum Donut-Segment
    const connectorPath = `M ${textX} ${underlineY} L ${innerX} ${underlineY} L ${segment.anchorX} ${segment.anchorY}`;

    const path = createSvgText('path', {
      class: 'label-connector',
      d: connectorPath,
    });

    const lineDelay =
      segments.length * donutConfig.animation.segmentStaggerMs +
      140 +
      index * donutConfig.animation.labelStaggerMs;
    path.style.setProperty('--line-delay', `${lineDelay}ms`);
    leadersLayer.append(path);

    const totalLength = path.getTotalLength();
    path.style.setProperty('--path-len', String(totalLength));

    const group = createSvgText('g', {
      class: `label-group label-${segment.side}`,
    });
    group.style.setProperty('--label-delay', `${lineDelay + 90}ms`);

    const title = createSvgText('text', {
      class: 'label-title',
      x: textX,
      y: titleTop,
      'text-anchor': textAnchor,
    });

    titleLines.forEach((line, lineIndex) => {
      const tspan = createSvgText('tspan', {
        x: textX,
        dy: lineIndex === 0 ? 0 : titleLineHeight,
      });
      tspan.textContent = line;
      title.append(tspan);
    });

    const desc = createSvgText('text', {
      class: 'label-desc',
      x: textX,
      y: descStartY,
      'text-anchor': textAnchor,
    });

    const lines = descLines.length > 0 ? descLines : [''];
    lines.forEach((line, lineIndex) => {
      const tspan = createSvgText('tspan', {
        x: textX,
        dy: lineIndex === 0 ? 0 : descLineHeight,
      });
      tspan.textContent = line;
      desc.append(tspan);
    });

    group.append(title, desc);
    labelsLayer.append(group);
  });

  return arcs;
};

const animateDonut = (root) => {
  if (root.dataset.played === 'true') {
    return;
  }

  const arcs = buildDonutGeometry(root);
  if (!arcs) {
    return;
  }

  root.dataset.played = 'true';
  root.classList.add('play');

  if (reduceMotion) {
    arcs.forEach((arc) => {
      arc.style.strokeDasharray = `${arc.dataset.len} ${arc.dataset.c}`;
      arc.style.strokeDashoffset = arc.dataset.offset;
    });
    root.classList.add('center-in');
    return;
  }

  arcs.forEach((arc, index) => {
    window.setTimeout(() => {
      arc.style.strokeDasharray = `${arc.dataset.len} ${arc.dataset.c}`;
    }, index * donutConfig.animation.segmentStaggerMs);
  });

  const centerDelay = arcs.length * donutConfig.animation.segmentStaggerMs + 180;
  window.setTimeout(() => {
    root.classList.add('center-in');
  }, centerDelay);
};

if ('IntersectionObserver' in window && animatedDonuts.length > 0) {
  const donutObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateDonut(entry.target);
          donutObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.34 }
  );

  animatedDonuts.forEach((el) => donutObserver.observe(el));
} else {
  animatedDonuts.forEach((el) => animateDonut(el));
}

(() => {
  const root = document.getElementById('te-study-donut');
  if (!root) {
    return;
  }

  const ringLayer = root.querySelector('.te-donut-ring');
  const connectorsLayer = root.querySelector('.te-donut-connectors');
  const labelsLayer = root.querySelector('.te-donut-labels');
  const mobileList = root.querySelector('.te-donut-mobile');

  if (!ringLayer || !connectorsLayer || !labelsLayer || !mobileList) {
    return;
  }

  // DATA
  const data = [
    { key: 'WIRTSCHAFT', value: 155, desc: ['Finance', 'Management', 'Marketing', 'Betriebswirtschaft'] },
    { key: 'TECHNIK', value: 35, desc: ['Maschinenbau', 'Energy Science', 'Elektrotechnik'] },
    { key: 'NATURWISSENSCHAFTEN', value: 15, desc: ['Psychologie', 'Chemie', 'Pharmazie', 'Physik'] },
    { key: 'RECHT', value: 28, desc: ['Rechtswissenschaften', 'Wirtschaftsrecht'] },
    { key: 'IT', value: 25, desc: ['Data Science', 'Informatik', 'Computer Science'] },
    { key: 'ANDERE', value: 12, desc: ['Politikwissenschaften', 'Sinologie', 'Lehramt'] },
  ];

  // COLORS
  const colors = {
    WIRTSCHAFT: '#FFFFFF',
    TECHNIK: '#4F9FFF',
    NATURWISSENSCHAFTEN: '#7EC8FF',
    RECHT: '#1A5EB8',
    IT: '#0A3D7A',
    ANDERE: '#A8D8FF',
  };

  // LAYOUT SLOTS
  const isUnternehmenPage = document.body.classList.contains('unternehmen-page');
  const isCompanyDonut = isUnternehmenPage && !root.classList.contains('te-donut-home-style');
  const isUnternehmenHomeStyleDonut = isUnternehmenPage && root.classList.contains('te-donut-home-style');
  const leftY = [-180, -60, 60, 180];
  const rightY = [-140, 0, 140];
  const leftX = isCompanyDonut ? -420 : isUnternehmenHomeStyleDonut ? -410 : -360;
  const rightX = isCompanyDonut ? 420 : 360;
  const rightEdgeX = rightX;
  const underlineLen = 200; // fallback
  const placement = { // PLACEMENT OVERRIDE
    ANDERE: { pos: 'left', slot: 0 },
    IT: { pos: 'left', slot: 1 },
    RECHT: { pos: 'left', slot: 2 },
    NATURWISSENSCHAFTEN: { pos: 'left', slot: 3 },
    WIRTSCHAFT: { pos: 'right', slot: 0 },
    TECHNIK: { pos: 'bottomRight', slot: 0 }, // TECHNIK LINE SHORTEN FIX
  };
  const leftElbowX = isCompanyDonut ? -136 : -230;
  const rightElbowX = isCompanyDonut ? 136 : 230;

  // DONUT SETTINGS
  const cx = 0;
  const cy = 0;
  const radius = isCompanyDonut ? 180 : 160;
  const strokeWidth = isCompanyDonut ? 55 : 48;
  const rotateDeg = 235;
  const circumference = 2 * Math.PI * radius;
  const START_ANGLE_RAD = (rotateDeg * Math.PI) / 180; // LABEL-SEGMENT MAPPING FIX
  const labelDistanceRadius = isCompanyDonut ? 186 : radius;
  const techX = cx + labelDistanceRadius + 20; // TECHNIK POSITION + DIAGONAL LINE FIX
  const techY = cy + labelDistanceRadius + 50; // TECHNIK POSITION + DIAGONAL LINE FIX
  const techStub = isCompanyDonut ? 84 : 60;
  const connectorLabelPadding = isCompanyDonut ? 30 : 18;

  // Keep the drawn order configurable so segment positions match the visual reference.
  const ringOrder = ['WIRTSCHAFT', 'TECHNIK', 'NATURWISSENSCHAFTEN', 'IT', 'ANDERE', 'RECHT'];

  // ANIMATION TIMING
  const segmentDuration = 900;
  const segmentStagger = 200;
  const labelStagger = 120;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const toDisplayName = (key) =>
    (key || '')
      .toLowerCase()
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (m) => m.toUpperCase());

  const hexToRgb = (hex) => {
    const clean = (hex || '').replace('#', '').trim();
    if (clean.length !== 6) {
      return null;
    }
    const int = Number.parseInt(clean, 16);
    if (!Number.isFinite(int)) {
      return null;
    }
    return {
      r: (int >> 16) & 255,
      g: (int >> 8) & 255,
      b: int & 255,
    };
  };

  const lightenHex = (hex, amount) => {
    const rgb = hexToRgb(hex);
    if (!rgb) {
      return hex;
    }
    const mix = (v) => Math.round(v + (255 - v) * amount);
    return `rgb(${mix(rgb.r)}, ${mix(rgb.g)}, ${mix(rgb.b)})`;
  };

  const orderedData = data; // LABEL-SEGMENT MAPPING FIX
  const total = orderedData.reduce((acc, item) => acc + item.value, 0);

  if (total <= 0) {
    return;
  }

  const ns = 'http://www.w3.org/2000/svg';
  const segments = [];
  const angles = new Map(); // LABEL-SEGMENT MAPPING FIX
  let accLen = 0;

  ringLayer.innerHTML = '';
  connectorsLayer.innerHTML = '';
  labelsLayer.innerHTML = '';
  mobileList.innerHTML = '';
  ringLayer.setAttribute('transform', `rotate(${rotateDeg} ${cx} ${cy})`);

  orderedData.forEach((item, index) => {
    const isLast = index === orderedData.length - 1;
    const len = isLast ? circumference - accLen : (item.value / total) * circumference;
    const startLen = accLen;
    const midLen = startLen + len / 2; // LABEL-SEGMENT MAPPING FIX
    const midAngle = (midLen / circumference) * (2 * Math.PI) + START_ANGLE_RAD; // LABEL-SEGMENT MAPPING FIX

    const arc = document.createElementNS(ns, 'circle');
    arc.setAttribute('class', 'te-donut-arc');
    arc.setAttribute('cx', String(cx));
    arc.setAttribute('cy', String(cy));
    arc.setAttribute('r', String(radius));
    arc.style.setProperty('--arc-w', `${strokeWidth}px`);
    arc.style.stroke = colors[item.key] || '#d9e4f0';
    arc.style.transitionDuration = `${segmentDuration}ms`;
    arc.style.strokeDasharray = `0 ${circumference}`;
    arc.style.strokeDashoffset = `${-startLen}`;
    arc.dataset.len = String(len);
    arc.dataset.c = String(circumference);
    arc.dataset.offset = String(-startLen);
    ringLayer.append(arc);
    angles.set(item.key, midAngle); // LABEL-SEGMENT MAPPING FIX

    segments.push({
      ...item,
      arc,
      midAngle,
    });

    accLen += len;
  });

  if (!isCompanyDonut) {
    const segmentMap = new Map(segments.map((item) => [item.key, item]));
    const labelSlots = segments
      .map((seg) => {
        const cfg = placement[seg.key]; // PLACEMENT OVERRIDE
        if (!cfg) {
          return null;
        }

        const mappedAngle = angles.get(seg.key);
        const ax = cx + Math.cos(mappedAngle) * radius;
        const ay = cy + Math.sin(mappedAngle) * radius;

        if (cfg.pos === 'left') {
          return {
            key: seg.key,
            side: 'left',
            x: leftX,
            y: leftY[Math.min(cfg.slot, leftY.length - 1)],
            elbowX: leftElbowX,
            ax,
            ay,
          };
        }

        if (cfg.pos === 'right') {
          return {
            key: seg.key,
            side: 'right',
            x: rightX,
            y: rightY[Math.min(cfg.slot, rightY.length - 1)],
            elbowX: rightElbowX,
            ax,
            ay,
          };
        }

        return {
          key: seg.key,
          side: 'bottomRight', // TECHNIK LINE SHORTEN FIX
          x: rightEdgeX,
          y: techY, // TECHNIK POSITION + DIAGONAL LINE FIX
          ax,
          ay,
        };
      })
      .filter(Boolean);

    labelSlots.forEach((slot, index) => {
      const seg = segmentMap.get(slot.key);
      if (!seg) {
        return;
      }

      const ax = slot.ax;
      const ay = slot.ay;

      const titleLines = slot.key === 'NATURWISSENSCHAFTEN' ? ['NATUR-', 'WISSENSCHAFTEN'] : [slot.key];
      const titleTop = slot.side === 'bottomRight' ? slot.y : slot.y - 24; // TECHNIK LINE SHORTEN FIX
      const underlineY =
        slot.side === 'bottomRight'
          ? slot.y + 18 // TECHNIK LINE SHORTEN FIX
          : titleTop + titleLines.length * 18 + 4;
      const descStartY = slot.side === 'bottomRight' ? slot.y + 46 : underlineY + 22; // TECHNIK LINE SHORTEN FIX
      const anchor =
        slot.side === 'left' ? 'start' : 'end';

      const labelGroup = document.createElementNS(ns, 'g');
      labelGroup.setAttribute('class', 'te-label');
      const connectorDelay = segments.length * segmentStagger + 120 + index * labelStagger;
      labelGroup.style.setProperty('--label-delay', `${connectorDelay + 90}ms`);

      const title = document.createElementNS(ns, 'text');
      title.setAttribute('class', 'te-label-title');
      title.setAttribute('x', String(slot.x));
      title.setAttribute('y', String(titleTop));
      title.setAttribute('text-anchor', anchor);
      titleLines.forEach((line, i) => {
        const tspan = document.createElementNS(ns, 'tspan');
        tspan.setAttribute('x', String(slot.x));
        tspan.setAttribute('dy', i === 0 ? '0' : '18');
        tspan.textContent = line;
        title.append(tspan);
      });

      const desc = document.createElementNS(ns, 'text');
      desc.setAttribute('class', 'te-label-desc');
      desc.setAttribute('x', String(slot.x));
      desc.setAttribute('y', String(descStartY));
      desc.setAttribute('text-anchor', anchor);
      seg.desc.forEach((line, i) => {
        const tspan = document.createElementNS(ns, 'tspan');
        tspan.setAttribute('x', String(slot.x));
        tspan.setAttribute('dy', i === 0 ? '0' : '14');
        tspan.textContent = line;
        desc.append(tspan);
      });

      labelGroup.append(title, desc);
      labelsLayer.append(labelGroup);

      const connector = document.createElementNS(ns, 'path');
      if (slot.side === 'bottomRight') {
        const titleWidth = title.getBBox().width;
        const horizontalBaseLen = Math.max(0, titleWidth + connectorLabelPadding) || underlineLen;
        const dynamicUnderlineLen = horizontalBaseLen;
        const underlineEndX = slot.x;
        const underlineStartX = slot.x - dynamicUnderlineLen;
        const elbowX = underlineStartX - techStub;
        const elbowY = underlineY;
        connector.setAttribute(
          'd',
          `M ${underlineStartX} ${underlineY} L ${underlineEndX} ${underlineY} M ${underlineStartX} ${underlineY} L ${elbowX} ${elbowY} L ${ax} ${ay}`
        );
      } else {
        connector.setAttribute(
          'd',
          `M ${slot.x} ${underlineY} L ${slot.elbowX} ${underlineY} L ${ax} ${ay}`
        );
      }
      connector.setAttribute('class', 'te-connector');
      connector.style.setProperty('--line-delay', `${connectorDelay}ms`);
      connectorsLayer.append(connector);
      connector.style.setProperty('--path-len', String(connector.getTotalLength()));
    });

    labelSlots.forEach((slot) => {
      const seg = segmentMap.get(slot.key);
      if (!seg) {
        return;
      }

      const li = document.createElement('li');
      li.style.setProperty('--bullet', colors[slot.key] || '#fff');
      const body = document.createElement('div');
      const strong = document.createElement('strong');
      strong.textContent = slot.key;
      const span = document.createElement('span');
      span.textContent = seg.desc.join(', ');
      body.append(strong, span);
      li.append(body);
      mobileList.append(li);
    });
  } else {
    root.classList.add('is-clean-donut');
    mobileList.style.display = 'none';

    const tooltip = document.createElement('div');
    tooltip.className = 'te-donut-tooltip';
    tooltip.innerHTML =
      '<div class="te-donut-tooltip-head"><strong></strong><span class="te-donut-tooltip-share"></span></div><p class="te-donut-tooltip-copy"></p>';
    root.append(tooltip);

    const tooltipTitle = tooltip.querySelector('strong');
    const tooltipShare = tooltip.querySelector('.te-donut-tooltip-share');
    const tooltipCopy = tooltip.querySelector('.te-donut-tooltip-copy');

    const updateTooltipPosition = (event) => {
      const rect = root.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      tooltip.style.left = `${x + 16}px`;
      tooltip.style.top = `${y - 18}px`;
    };

    const clearHover = () => {
      root.classList.remove('has-active-segment');
      segments.forEach((seg) => {
        seg.arc.classList.remove('is-active', 'is-dimmed');
        seg.arc.setAttribute('r', String(radius));
        seg.arc.style.stroke = colors[seg.key] || '#d9e4f0';
        seg.arc.style.opacity = '1';
      });
      tooltip.classList.remove('is-visible');
    };

    const setActiveSegment = (activeSeg, event) => {
      root.classList.add('has-active-segment');
      segments.forEach((seg) => {
        const isActive = seg === activeSeg;
        seg.arc.classList.toggle('is-active', isActive);
        seg.arc.classList.toggle('is-dimmed', !isActive);
        seg.arc.setAttribute('r', String(isActive ? radius + 8 : radius));
        seg.arc.style.stroke = isActive ? lightenHex(colors[seg.key] || '#d9e4f0', 0.2) : colors[seg.key] || '#d9e4f0';
        seg.arc.style.opacity = isActive ? '1' : '0.28';
      });

      if (tooltipTitle && tooltipShare && tooltipCopy) {
        const share = `${((activeSeg.value / total) * 100).toFixed(1)}%`;
        tooltipTitle.textContent = toDisplayName(activeSeg.key);
        tooltipShare.textContent = share;
        tooltipCopy.textContent = activeSeg.desc.join(', ');
      }

      updateTooltipPosition(event);
      tooltip.classList.add('is-visible');
    };

    segments.forEach((seg) => {
      seg.arc.style.cursor = 'pointer';
      seg.arc.addEventListener('mouseenter', (event) => setActiveSegment(seg, event));
      seg.arc.addEventListener('mousemove', (event) => updateTooltipPosition(event));
      seg.arc.addEventListener('mouseleave', clearHover);
    });

    root.addEventListener('mouseleave', clearHover);
  }

  const play = () => {
    if (root.dataset.played === 'true') {
      return;
    }
    root.dataset.played = 'true';
    root.classList.add('play');

    if (reduce) {
      segments.forEach((seg) => {
        seg.arc.style.strokeDasharray = `${seg.arc.dataset.len} ${seg.arc.dataset.c}`;
      });
      return;
    }

    segments.forEach((seg, index) => {
      window.setTimeout(() => {
        seg.arc.style.strokeDasharray = `${seg.arc.dataset.len} ${seg.arc.dataset.c}`;
      }, index * segmentStagger);
    });
  };

  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            play();
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.35 }
    );
    io.observe(root);
  } else {
    play();
  }
})();

(() => {
  const section = document.querySelector('.value-section');
  if (!section) {
    return;
  }

  const tilesRoot = section.querySelector('[data-value-tiles]');
  const tileEls = tilesRoot ? Array.from(tilesRoot.querySelectorAll('.value-image-tile')) : [];
  const statsRoot = section.querySelector('[data-value-stats]');
  const statEls = statsRoot ? Array.from(statsRoot.querySelectorAll('[data-stat-value]')) : [];
  /* BENEFIT TILE BACKGROUND IMAGES (assets/media/home) */
  const valueTileBackgrounds = {
    talent: '/assets/media/home/Talent_Acquisition.jpg',
    teilnehmende: '/assets/media/home/Teilnehmende.jpg',
    kennenlernen: '/assets/media/home/Kennenlernen.jpg',
    recruiting: '/assets/media/home/Recruiting.jpg',
    networking: '/assets/media/home/Networking.jpg',
    allround: '/assets/media/home/Allround_Service.jpg',
  };

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  tileEls.forEach((tile) => {
    const key = tile.dataset.bg || '';
    const imagePath = valueTileBackgrounds[key];
    if (!imagePath) {
      return;
    }
    tile.style.setProperty('--benefit-bg', `url('${imagePath}')`);
  });

  const revealTiles = () => {
    if (!tileEls.length || tilesRoot?.dataset.revealed === 'true') {
      return;
    }

    if (tilesRoot) {
      tilesRoot.dataset.revealed = 'true';
    }

    tileEls.forEach((tile, index) => {
      if (reduceMotion) {
        tile.classList.add('is-visible');
        return;
      }

      window.setTimeout(() => {
        tile.classList.add('is-visible');
      }, index * 110);
    });
  };

  const animateValueStats = () => {
    if (!statsRoot || statEls.length === 0 || statsRoot.dataset.counted === 'true') {
      return;
    }

    statsRoot.dataset.counted = 'true';

    statEls.forEach((el, index) => {
      const target = Number.parseInt(el.getAttribute('data-stat-value') || '0', 10);
      const suffix = el.getAttribute('data-stat-suffix') || '';
      if (!Number.isFinite(target)) {
        return;
      }

      if (reduceMotion) {
        el.textContent = `${target}${suffix}`;
        return;
      }

      const delay = index * 110;
      const duration = 1100;
      const startAt = performance.now() + delay;

      const tick = (now) => {
        if (now < startAt) {
          requestAnimationFrame(tick);
          return;
        }
        const progress = Math.min((now - startAt) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const value = Math.round(target * eased);
        el.textContent = `${value}${suffix}`;
        if (progress < 1) {
          requestAnimationFrame(tick);
        }
      };

      requestAnimationFrame(tick);
    });
  };

  if (statsRoot) {
    if (!('IntersectionObserver' in window)) {
      animateValueStats();
    } else {
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              animateValueStats();
              io.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.35 }
      );
      io.observe(statsRoot);
    }
  }

  if (tilesRoot && tileEls.length > 0) {
    if (!('IntersectionObserver' in window)) {
      revealTiles();
    } else {
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              revealTiles();
              io.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.2 }
      );
      io.observe(tilesRoot);
    }
  }
})();

(() => {
  const section = document.querySelector('.te2025-highlights');
  const locationArt = section?.querySelector('.te2025-location-card img');
  if (!section || !locationArt) {
    return;
  }

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion) {
    section.style.setProperty('--te2025-location-parallax', '0px');
    return;
  }

  let raf = null;
  const update = () => {
    const rect = section.getBoundingClientRect();
    const viewportH = window.innerHeight || document.documentElement.clientHeight;
    const progress = (viewportH - rect.top) / (viewportH + rect.height);
    const clamped = Math.max(0, Math.min(1, progress));
    const offset = (clamped - 0.5) * 24;
    section.style.setProperty('--te2025-location-parallax', `${offset.toFixed(2)}px`);
    raf = null;
  };

  const onScroll = () => {
    if (raf !== null) {
      return;
    }
    raf = window.requestAnimationFrame(update);
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  update();
})();

(() => {
  const marquee = document.querySelector('[data-partner-marquee]');
  const detail = document.querySelector('[data-partner-detail]');

  if (!marquee || !detail) {
    return;
  }

  const cards = Array.from(marquee.querySelectorAll('.logo-marquee-card[data-partner-key]'));
  const detailLogo = detail.querySelector('[data-partner-detail-logo]');
  const detailTitle = detail.querySelector('[data-partner-detail-title]');
  const detailText = detail.querySelector('[data-partner-detail-text]');
  const detailLink = detail.querySelector('[data-partner-detail-link]');
  const detailClose = detail.querySelector('[data-partner-detail-close]');

  if (!detailLogo || !detailTitle || !detailText || !detailLink || !detailClose || cards.length === 0) {
    return;
  }

  detail.hidden = true;

  const partnerData = {
    bcg: {
      title: 'BCG',
      text: 'Die Boston Consulting Group ist die weltweit führende strategische Unternehmensberatung. Wir entwickeln in enger Zusammenarbeit mit unseren Kund:innen neue Lösungen und setzen diese dann gemeinsam in die Tat um. Nur so entstehen Strategien, die sich als nachhaltige Wettbewerbsvorteile bezahlt machen. Nur so entsteht Vertrauen. Und deshalb sind wir für unsere Kund:innen mehr als Berater:innen. Wir sind Partner:innen.BCG sucht herausragende Absolvent:innen aller Fachrichtungen sowie Professionals, die bereit sind, durch herausfordernde Aufgaben ständig Neues zu lernen. Unsere Berater:innen im Geschäftsregion “Central Europe” sind zu 50% Absolventen von MINT-Fächern, Naturwissenschaften, und anderen Disziplinen. Zusätzlich zu den Festeinstellungen geben wir Visiting Associates die Möglichkeit, unsere Fallarbeit über 8 bis 12 Wochen im Rahmen eines Praktikums zu begleiten – und zwar vor Ort bei unseren Kund:innen. Uns interessieren Menschen, die Eigeninitiative, Neugier und eine schnelle Auffassungsgabe mitbringen.',
      href: 'https://www.bcg.com/',
      logo: 'assets/logos/BCG_logo.png',
    },
    ey: {
      title: 'EY Parthenon',
      text: '„Gemeinsam zukunftsweisende Lösungen für die Wirtschaftswelt von morgen entwickeln.” - Das ist das Ziel von rund 1.400 Kolleg:innen an österreichweit vier Standorten von EYP (Wien, Linz, Salzburg und Klagenfurt). Als eines der marktführenden Unternehmen in der Wirtschaftsprüfung, Steuerberatung, Strategy and Transactions sowie im Consulting begleitet EYP Kund:innen mit innovativen Dienstleistungen in die Zukunft. EY Parthenon steht dem Top-Management zur Seite, wenn es darum geht, die Strategie in einem sich schnell wandelnden Umfeld zu transformieren, in herausfordernden Zeiten Maßnahmen der Restrukturierung und Sanierung umzusetzen, Wachstum zu generieren und neue Märkte zu erschließen. Als Teil eines internationalen Teams gestaltest also DU die Zukunft zusammen mit den Entscheidungsträger:innen. “It’s yours to build.”',
      href: 'https://www.ey.com/de_at/strategy-transactions/parthenon',
      logo: 'assets/logos/EY_Parthenon_logo.svg.png',
    },
    accilium: {
      title: 'accilium',
      text: 'accilium ist eine Managementberatung, die mit dem Kerngedanken ständiger Weiterentwicklung als Schlüssel zum Erfolg gegründet wurde. Mit Know-How in den Bereichen Automotive & Supplier, Public & Infrastructure sowie Energy & Environment löst accilium Herausforderungen seiner Kund:innen im Mobilitäts-Ökosystem. Konkret setzt accilium seine Mission der Beschleunigung der Mobilitätswende wie folgt um: accilium unterstützt die führenden Akteure des Mobilitäts-Ökosystems dabei, ihre Organisationen zukunftsfit zu machen. Das Unternehmen unterstützt Akteuren, die in den Mobilitätsmarkt eintreten oder eintreten möchten bei der Entwicklung und Kalkulation von go2market-Strategien. Außerdem informiert accilium in seiner Rolle im „Thought Leadership on Mobility of the future“ über die Trends der Elektrifizierung, der Shared Economy, des autonomen Fahrens und der Digitalisierung, um so Bedenken der Gesellschaft hinsichtlich des Mobilitätswandels zu mindern.',
      href: 'https://www.accilium.com/',
      logo: 'assets/logos/accilium_logo.png',
    },
    billa: {
      title: 'BILLA',
      text: 'Seit bereits 70 Jahren gehört BILLA einfach zum österreichischen Lebensmittelhandel dazu. Mit rund 1.300 Märkten in ganzBillarreich ist BILLA ein wichtiger Nahversorger und verspricht mit einer Auswahl von über 30.000 verschiedenen Produkten ein genussvolles Einkaufserlebnis. Wichtige aktuelle strategische Schwerpunkte wie Plant-Based, Regionalität, Nachhaltigkeit und Digitalisierung werden aktiv vorangetrieben. Um dies erfolgreich umzusetzen, sind mehr als 30.000 Mitarbeiter:innen und ca. 1.800 Lehrlinge in den Märkten, im Vertriebsaußendienst sowie in der Zentrale beschäftigt. Die Billa Mitarbeiter:innen machen das Unternehmen zu einem der erfolgreichsten im Land. So wird ein Umfeld geschaffen, das allen Mitarbeiter:innen optimale Arbeitsbedingungen, Chancengerechtigkeit und Gestaltungsfreiraum bietet. Besonders am Herzen liegt Billa die Vereinbarkeit von Beruf und Familie sowie Vielfalt – nicht nur auf Karrierewegen, sondern vor allem in den Teams.',
      href: 'https://www.billa.at/',
      logo: 'assets/logos/Billa_logo.svg.png',
    },
    efs: {
      title: 'EFS Consulting',
      text: 'EFS ist die größte unabhängige Unternehmensberatung Österreichs. Mit Hauptsitz in Wien und einem Office in China führen wir Projekte in Europa, Asien und Amerika durch. Unsere Wurzeln liegen im Bereich Automotive. Davon ausgehend haben wir Kompetenzen in vielen weiteren Bereichen aufgebaut, wie etwa Digitalisierung, IT-Transformation oder Informationssicherheit. Wir beraten Kunden entlang der gesamten Wertschöpfungskette und entwickeln gemeinsam Ideen, Konzepte, Produkte und Services für die Zukunft. Dazu braucht es Menschen mit Persönlichkeit, die mit Begeisterung an Herausforderungen herangehen und ihre individuellen Kompetenzen einbringen, um zukunftsweisende Lösungen zu erarbeiten. Einander zu entwickeln, Raum zur Entfaltung zu geben und eine positive Atmosphäre zu schaffen, ist uns dabei besonders wichtig.',
      href: 'https://www.efs.consulting/',
      logo: 'assets/logos/EFS_logo.png',
    },
    kearney: {
      title: 'Kearney',
      text: 'Unter den Unternehmensberatungen der Welt ist Kearney ein echtes Original. Seit nahezu 100 Jahren vertrauen uns Führungsetagen, Regierungsstellen und gemeinnützige Organisationen. Dabei hat Kearney für dich genau die richtige Größe: Deine Ideen haben für unsere Kunden aus Fortune 500, DAX-Unternehmen und global agierenden Mittelständlern höchste Relevanz. Gleichzeitig ist die Kearney Welt angenehm überschaubar. Unsere Teams an lebendigen Standorten wie Berlin, Düsseldorf, München, Wien und Zürich kennen, schätzen und unterstützen einander. Hier entwickelst du nicht nur deine fachliche Expertise. Bei Kearney hast du die Chance, deine einzigartige Persönlichkeit für dein Team und deine Klienten wirksam einzubringen. Denn das macht für uns ein Kearney Original aus.',
      href: 'https://www.kearney.com/',
      logo: 'assets/logos/Kearney_logo.png',
    },
    sonepar: {
      title: 'Sonepar',
      text: 'Sonepar ist ein unabhängiges Familienunternehmen und der weltweit führende Großhändler von elektrischen Gütern, Lösungen und Dienstleistungen für Kund:innen aus Handwerk, Handel, Industrie und Gewerbe. 2023 haben rund 45.000 Mitarbeiter:innen in 40 Ländern einen Umsatz von 33,3 Milliarden Euro erwirtschaftet. In Österreich sorgen über 500 Mitarbeiter:innen an 16 Standorten für umfangreiche Sortimente, hochwertige Logistik, Service und Beratung. Unseren Kund:innen bieten wir alle Vorteile eines vollständig digitalisierten und synchronisierten Omnichannel-Erlebnisses und persönliche Betreuung und Beratung als Vertrauensbasis des gemeinsamen Erfolgs. Mit dem Purpose „Powering Progress for Future Generations“ sieht Sonepar sich in der Verantwortung, den Fortschritt für künftige Generationen zu sichern und nachhaltig voranzutreiben. Umgesetzt wird dies in 230 Initiativen, Schulungsprogrammen und Innovationen rund um Ziele der Energieeffizienz, der digitalen Transformation, des Klima- und Umweltschutzes und der Inklusion.',
      href: 'https://www.sonepar.com/',
      logo: 'assets/logos/sonepar_logo.png',
    },
    post: {
      title: 'Österreichische Post',
      text: 'Die Österreichische Post AG ist ein international tätiger Post-, Logistik- und Dienstleistungskonzern mit herausragender Bedeutung für Österreich. Gegründet 1999, mit Hauptsitz in Wien und gesamt national und international rund 27.000 Mitarbeiter*innen. Das Unternehmen steht für höchste Qualität und bietet ein umfassendes Produkt- und Serviceportfolio, um aktuelle Kund*innenbedürfnisse bestens abzudecken. Die Post bündelt ihre Geschäftsaktivitäten in drei Divisionen: Brief & Werbepost, Paket & Logistik und Filiale & Bank. International ist die Post selektiv präsent in den Märkten Deutschland, Südost- und Osteuropa, der Türkei und Aserbaidschan.',
      href: 'https://www.post.at/',
      logo: 'assets/logos/Post_logo.png',
    },
    siemensenergy: {
      title: 'Siemens Energy',
      text: 'Siemens Energy gehört zu den weltweit führenden Unternehmen der Energietechnologie. Das Unternehmen arbeitet gemeinsam mit seinen Kunden und Partnern an den Energiesystemen der Zukunft und unterstützt so den Übergang zu einer nachhaltigeren Welt. Mit seinem Portfolio an Produkten, Lösungen und Services deckt Siemens Energy nahezu die gesamte Energiewertschöpfungskette ab - von der Energieerzeugung über die Energieübertragung bis hin zur Speicherung. Zum Portfolio zählen konventionelle und erneuerbare Energietechnik, zum Beispiel Gas- und Dampfturbinen, mit Wasserstoff betriebene Hybridkraftwerke, Generatoren und Transformatoren. Mehr als 50 Prozent des Portfolios sind bereits dekarbonisiert. Durch die Mehrheitsbeteiligung an der börsennotierten Siemens Gamesa Renewable Energy (SGRE) gehört Siemens Energy zu den Weltmarktführern bei Erneuerbaren Energien. Geschätzt ein Sechstel der weltweiten Stromerzeugung basiert auf Technologien von Siemens Energy. Siemens Energy beschäftigt weltweit rund 92.000 Mitarbeiter*innen in mehr als 90 Ländern und erzielte im Geschäftsjahr 2022 einen Umsatz von 29 Milliarden Euro.',
      href: 'https://www.siemens-energy.com/at/de/home.html',
      logo: 'assets/logos/SiemensEnergy_logo.png',
    },
    voestalpine: {
      title: 'voestalpine',
      text: 'voestalpine ist ein innovativer und weltweit führender Stahl- und Technologiekonzern. Die Metal Engineering Division mit weltweit rund 13.150 Mitarbeiter:innen ist mit dem Geschäftsbereich Railway Systems globaler Marktführer für Bahninfrastruktursysteme und Signaltechnik. Ein weiterer Bereich der Division, Industrial Systems, ist darüber hinaus europäischer Marktführer für Qualitätsdraht sowie globaler Anbieter von Schweißkomplettlösungen. Vom Standort Kindberg in Österreich werden zudem Nahtlosrohre zu Kund:innen in die ganze Welt geliefert. Besonders spannend: Die voestalpine Metal Engineering Division bietet Student:innen, welche 2-3 Jahre vor ihrem Studienabschluss stehen, ein dreistufiges Studierendenprogramm mit einem monatlichen Stipendium und eine anschließende Tätigkeit im Unternehmen an.',
      href: 'https://www.voestalpine.com/group/en/group/overview/organizational-chart/metal-engineering/',
      logo: 'assets/logos/Voestalpine_logo.png',
    },
  };

  const setActiveCard = (key) => {
    cards.forEach((card) => {
      card.classList.toggle('is-active', card.dataset.partnerKey === key);
    });
  };

  const openDetail = (key) => {
    const partner = partnerData[key];
    if (!partner) {
      return;
    }

    detailLogo.src = partner.logo;
    detailLogo.alt = partner.title;
    detailLogo.classList.toggle('efs-logo', key === 'efs');
    detailTitle.textContent = partner.title;
    detailText.textContent = partner.text;
    detailLink.href = partner.href;

    detail.hidden = false;
    marquee.classList.add('is-paused');
    setActiveCard(key);
  };

  const closeDetail = () => {
    detail.hidden = true;
    marquee.classList.remove('is-paused');
    cards.forEach((card) => card.classList.remove('is-active'));
  };

  marquee.addEventListener('click', (event) => {
    const target = event.target;
    if (!(target instanceof Element)) {
      return;
    }

    const clickedCard = target.closest('.logo-marquee-card[data-partner-key]');
    if (!clickedCard) {
      return;
    }

    const key = clickedCard.dataset.partnerKey;
    if (!key) {
      return;
    }

    openDetail(key);
  });

  detailClose.addEventListener('click', closeDetail);

  document.addEventListener('click', (event) => {
    if (detail.hidden) {
      return;
    }

    const target = event.target;
    if (!(target instanceof Element)) {
      return;
    }

    if (target.closest('[data-partner-detail]')) {
      return;
    }

    const clickedCard = target.closest('.logo-marquee-card');
    if (clickedCard) {
      return;
    }

    if (target.closest('[data-partner-marquee]')) {
      closeDetail();
      return;
    }

    closeDetail();
  });
})();

(() => {
  const carousel = document.querySelector('[data-workshop-carousel]');
  if (!carousel) {
    return;
  }

  const track = carousel.querySelector('[data-workshop-carousel-track]');
  const prevBtn = carousel.querySelector('.te2025-workshop-nav-prev');
  const nextBtn = carousel.querySelector('.te2025-workshop-nav-next');

  if (!track || !prevBtn || !nextBtn) {
    return;
  }

  const cards = Array.from(track.querySelectorAll('.te2025-workshop-card'));
  if (cards.length === 0) {
    return;
  }

  const total = cards.length;
  let activeIndex = 0;
  const wrap = (idx) => ((idx % total) + total) % total;
  const isDesktop = () => window.innerWidth >= 1024;
  const isHandy = () => window.innerWidth <= 760;
  const viewport = carousel.querySelector('.te2025-workshop-viewport');
  let hasResetHandyOnLoad = false;

  const shortestDelta = (idx, active) => {
    const forward = (idx - active + total) % total;
    const backward = forward - total;
    return Math.abs(forward) <= Math.abs(backward) ? forward : backward;
  };

  const clearMobileStyles = (card) => {
    card.style.transform = '';
    card.style.zIndex = '';
    card.style.opacity = '';
    card.classList.remove(
      'is-active',
      'is-prev',
      'is-next',
      'is-far-left',
      'is-far-right',
      'is-out-left',
      'is-out-right'
    );
  };

  const renderDesktop = () => {
    const baseDesktopWidth = 480;
    const offset = baseDesktopWidth * 0.6;
    const farOffset = baseDesktopWidth * 1.25;

    cards.forEach((card, idx) => {
      const delta = shortestDelta(idx, activeIndex);
      card.classList.remove(
        'is-active',
        'is-prev',
        'is-next',
        'is-far-left',
        'is-far-right',
        'is-out-left',
        'is-out-right'
      );

      let x = 0;
      let scale = 0.6;
      let z = 0;
      let opacity = 0;

      if (delta === 0) {
        card.classList.add('is-active');
        scale = 1;
        z = 3;
        opacity = 1;
      } else if (delta === -1) {
        card.classList.add('is-prev');
        x = -offset;
        scale = 0.75;
        z = 2;
        opacity = 1;
      } else if (delta === 1) {
        card.classList.add('is-next');
        x = offset;
        scale = 0.75;
        z = 2;
        opacity = 1;
      } else if (delta < -1) {
        card.classList.add('is-out-left');
        x = -farOffset;
      } else {
        card.classList.add('is-out-right');
        x = farOffset;
      }

      card.style.transform = `translate(-50%, -50%) translateX(${x}px) scale(${scale})`;
      card.style.zIndex = String(z);
      card.style.opacity = String(opacity);
    });
  };

  const renderMobile = () => {
    cards.forEach(clearMobileStyles);
  };

  const resetToFirstCardOnHandy = () => {
    if (!isHandy() || !viewport) {
      return;
    }
    viewport.scrollTo({ left: 0, behavior: 'auto' });
  };

  const render = () => {
    if (isDesktop()) {
      renderDesktop();
      return;
    }
    renderMobile();

    if (!hasResetHandyOnLoad) {
      window.requestAnimationFrame(() => {
        resetToFirstCardOnHandy();
        window.requestAnimationFrame(resetToFirstCardOnHandy);
        window.setTimeout(resetToFirstCardOnHandy, 120);
      });
      hasResetHandyOnLoad = true;
    }
  };

  const go = (direction) => {
    activeIndex = wrap(activeIndex + direction);
    render();
  };

  prevBtn.addEventListener('click', () => go(-1));
  nextBtn.addEventListener('click', () => go(1));
  prevBtn.disabled = false;
  nextBtn.disabled = false;
  window.addEventListener('resize', render);
  window.addEventListener('load', resetToFirstCardOnHandy);
  window.addEventListener('pageshow', resetToFirstCardOnHandy);
  render();
})();

(() => {
  const stack = document.querySelector('[data-te-2026-stack]');
  if (!stack) {
    return;
  }

  const cards = Array.from(stack.querySelectorAll('[data-te-2026-card]'));
  if (cards.length === 0) {
    return;
  }

  const stateClasses = ['card-active', 'card-second', 'card-third', 'card-fourth'];
  let order = [...cards];
  const isDesktop = () => window.innerWidth >= 992;

  const render = () => {
    cards.forEach((card) => {
      stateClasses.forEach((className) => card.classList.remove(className));
    });

    order.forEach((card, index) => {
      const className = stateClasses[index];
      if (className) {
        card.classList.add(className);
      }
    });
  };

  const rotateCards = () => {
    if (!isDesktop()) {
      return;
    }

    const firstCard = order.shift();
    if (!firstCard) {
      return;
    }
    order.push(firstCard);
    render();
  };

  stack.addEventListener('click', rotateCards);
  stack.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      rotateCards();
    }
  });

  window.addEventListener('resize', render);
  render();
})();
