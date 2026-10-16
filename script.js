/* =========================================================
   KGTÜ Biogen Topluluğu — Biyo-İndikatörler Projesi
   Etkileşimler: navigasyon, scroll animasyonları, form (front-end)
   ========================================================= */

document.documentElement.classList.add('js');

const WORKSHOP_DATE = new Date('2026-11-06T09:00:00+03:00');
const MAX_FILES = 3;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const MIN_DESC_LENGTH = 30;

const ILLER = [
  'Adana', 'Adıyaman', 'Afyonkarahisar', 'Ağrı', 'Aksaray', 'Amasya', 'Ankara', 'Antalya', 'Ardahan', 'Artvin',
  'Aydın', 'Balıkesir', 'Bartın', 'Batman', 'Bayburt', 'Bilecik', 'Bingöl', 'Bitlis', 'Bolu', 'Burdur',
  'Bursa', 'Çanakkale', 'Çankırı', 'Çorum', 'Denizli', 'Diyarbakır', 'Düzce', 'Edirne', 'Elazığ', 'Erzincan',
  'Erzurum', 'Eskişehir', 'Gaziantep', 'Giresun', 'Gümüşhane', 'Hakkari', 'Hatay', 'Iğdır', 'Isparta', 'İstanbul',
  'İzmir', 'Kahramanmaraş', 'Karabük', 'Karaman', 'Kars', 'Kastamonu', 'Kayseri', 'Kilis', 'Kırıkkale', 'Kırklareli',
  'Kırşehir', 'Kocaeli', 'Konya', 'Kütahya', 'Malatya', 'Manisa', 'Mardin', 'Mersin', 'Muğla', 'Muş',
  'Nevşehir', 'Niğde', 'Ordu', 'Osmaniye', 'Rize', 'Sakarya', 'Samsun', 'Siirt', 'Sinop', 'Sivas',
  'Şanlıurfa', 'Şırnak', 'Tekirdağ', 'Tokat', 'Trabzon', 'Tunceli', 'Uşak', 'Van', 'Yalova', 'Yozgat', 'Zonguldak'
];

document.addEventListener('DOMContentLoaded', () => {
  initHeader();
  initMobileMenu();
  initActiveNav();
  initReveal();
  initCountdown();
  initForm();
  initModals();
  document.getElementById('year').textContent = new Date().getFullYear();
});

/* ---------- Header: scrolled state + back-to-top ---------- */
function initHeader() {
  const header = document.getElementById('siteHeader');
  const toTop = document.getElementById('toTop');

  const onScroll = () => {
    const y = window.scrollY;
    header.classList.toggle('is-scrolled', y > 40);
    toTop.hidden = y < 600;
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

/* ---------- Modals (native <dialog>: centered, focus-trapped, Esc to close) ---------- */
function initModals() {
  const CLOSE_MS = 200; // matches .modal.is-closing animation

  const open = (dialog) => {
    if (dialog.open) return;
    dialog.classList.remove('is-closing');
    dialog.showModal();
    document.documentElement.classList.add('modal-open');
    dialog.querySelector('.modal-body')?.scrollTo(0, 0);
  };

  const close = (dialog) => {
    if (!dialog.open || dialog.classList.contains('is-closing')) return;
    dialog.classList.add('is-closing');
    setTimeout(() => {
      dialog.classList.remove('is-closing');
      dialog.close();
      document.documentElement.classList.remove('modal-open');
    }, CLOSE_MS);
  };

  document.querySelectorAll('[data-open-modal]').forEach((trigger) => {
    const dialog = document.getElementById(trigger.dataset.openModal);
    if (!dialog) return;
    trigger.addEventListener('click', (e) => {
      e.preventDefault(); // the trigger sits inside the consent <label>; don't toggle the checkbox
      open(dialog);
    });
  });

  document.querySelectorAll('dialog.modal').forEach((dialog) => {
    dialog.querySelectorAll('[data-close-modal]').forEach((btn) => btn.addEventListener('click', () => close(dialog)));

    // Clicking the dimmed backdrop (outside the panel) closes it
    dialog.addEventListener('click', (e) => { if (e.target === dialog) close(dialog); });

    // Esc: animate out instead of closing instantly
    dialog.addEventListener('cancel', (e) => { e.preventDefault(); close(dialog); });
  });
}

/* ---------- Mobile menu ---------- */
function initMobileMenu() {
  const toggle = document.getElementById('menuToggle');
  const menu = document.getElementById('mobileMenu');
  const header = document.getElementById('siteHeader');

  const setOpen = (open) => {
    menu.hidden = !open;
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Menüyü kapat' : 'Menüyü aç');
    header.classList.toggle('menu-open', open);
  };

  toggle.addEventListener('click', () => setOpen(menu.hidden));
  menu.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => setOpen(false)));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setOpen(false); });
  window.matchMedia('(min-width: 1024px)').addEventListener('change', (e) => { if (e.matches) setOpen(false); });
}

/* ---------- Highlight the nav link of the section in view ---------- */
function initActiveNav() {
  const links = document.querySelectorAll('.nav-link, .mobile-link');
  const sections = ['anasayfa', 'hakkinda', 'takvim', 'veri-yukle', 'iletisim']
    .map((id) => document.getElementById(id))
    .filter(Boolean);

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const id = entry.target.id;
      links.forEach((l) => l.classList.toggle('is-active', l.getAttribute('href') === `#${id}`));
    });
  }, { rootMargin: '-45% 0px -50% 0px' });

  sections.forEach((s) => observer.observe(s));
}

/* ---------- Scroll reveal ---------- */
function initReveal() {
  const items = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window)) {
    items.forEach((el) => el.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  // Stagger siblings slightly for a smoother cascade
  items.forEach((el) => {
    const siblings = [...el.parentElement.children].filter((c) => c.classList.contains('reveal'));
    el.style.transitionDelay = `${Math.min(siblings.indexOf(el), 4) * 80}ms`;
    observer.observe(el);
  });
}

/* ---------- Days until the Göksu workshop ---------- */
function initCountdown() {
  const el = document.getElementById('countdownDays');
  const days = Math.ceil((WORKSHOP_DATE - new Date()) / 86400000);
  el.textContent = days > 0 ? days : '0';
}

/* ---------- Upload form (front-end only) ---------- */
function initForm() {
  const form = document.getElementById('uploadForm');
  const success = document.getElementById('formSuccess');
  const select = document.getElementById('il');
  const fileInput = document.getElementById('foto');
  const dropzone = document.getElementById('dropzone');
  const previewList = document.getElementById('previewList');
  const fotoError = document.getElementById('fotoError');
  const textarea = document.getElementById('aciklama');
  const charCount = document.getElementById('charCount');
  const kvkk = document.getElementById('kvkk');
  const kvkkError = document.getElementById('kvkkError');

  let files = [];

  // Provinces
  ILLER.forEach((il) => select.add(new Option(il, il)));

  // Character counter
  const updateCount = () => {
    const len = textarea.value.length;
    charCount.textContent = `${len} / ${textarea.maxLength}`;
    charCount.style.color = len >= MIN_DESC_LENGTH ? '#22623f' : '';
  };
  textarea.addEventListener('input', updateCount);

  // ---- Files ----
  const addFiles = (incoming) => {
    const messages = [];
    for (const file of incoming) {
      if (!file.type.startsWith('image/')) { messages.push(`"${file.name}" bir görsel dosyası değil.`); continue; }
      if (file.size > MAX_FILE_SIZE) { messages.push(`"${file.name}" 10 MB sınırını aşıyor.`); continue; }
      if (files.length >= MAX_FILES) { messages.push(`En fazla ${MAX_FILES} fotoğraf yükleyebilirsiniz.`); break; }
      files.push(file);
    }
    renderPreviews();
    if (messages.length) {
      fotoError.textContent = messages.join(' ');
      fotoError.classList.add('is-visible');
    } else {
      fotoError.classList.remove('is-visible');
      dropzone.parentElement.classList.remove('has-error');
    }
  };

  const renderPreviews = () => {
    previewList.querySelectorAll('img').forEach((img) => URL.revokeObjectURL(img.src));
    previewList.innerHTML = '';
    files.forEach((file, i) => {
      const li = document.createElement('li');
      li.className = 'preview-item';
      const fig = document.createElement('figure');
      const img = document.createElement('img');
      img.src = URL.createObjectURL(file);
      img.alt = file.name;
      const cap = document.createElement('figcaption');
      cap.textContent = `${file.name} · ${(file.size / 1024 / 1024).toFixed(1)} MB`;
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'preview-remove';
      btn.setAttribute('aria-label', `${file.name} dosyasını kaldır`);
      btn.textContent = '×';
      btn.addEventListener('click', () => { files.splice(i, 1); renderPreviews(); });
      fig.append(img, cap);
      li.append(fig, btn);
      previewList.append(li);
    });
  };

  fileInput.addEventListener('change', () => {
    addFiles(fileInput.files);
    fileInput.value = ''; // allow re-selecting the same file
  });

  ['dragenter', 'dragover'].forEach((evt) => dropzone.addEventListener(evt, (e) => {
    e.preventDefault();
    dropzone.classList.add('is-dragover');
  }));
  ['dragleave', 'drop'].forEach((evt) => dropzone.addEventListener(evt, (e) => {
    e.preventDefault();
    dropzone.classList.remove('is-dragover');
  }));
  dropzone.addEventListener('drop', (e) => addFiles(e.dataTransfer.files));

  // ---- Validation ----
  const fieldOf = (el) => el.closest('.field');
  const setError = (el, hasError) => fieldOf(el)?.classList.toggle('has-error', hasError);

  const validate = () => {
    let firstInvalid = null;
    const mark = (el, invalid) => {
      setError(el, invalid);
      if (invalid && !firstInvalid) firstInvalid = el;
    };

    ['ad', 'soyad', 'universite', 'konum'].forEach((id) => {
      const el = document.getElementById(id);
      mark(el, el.value.trim().length < 2);
    });
    mark(select, !select.value);

    const eposta = document.getElementById('eposta');
    mark(eposta, !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(eposta.value.trim()));

    const duzey = document.getElementById('duzey');
    mark(duzey, !duzey.value);

    const turChecked = form.querySelector('input[name="tur"]:checked');
    mark(form.querySelector('input[name="tur"]'), !turChecked);

    if (!files.length) {
      fotoError.textContent = 'Lütfen en az bir fotoğraf yükleyin.';
      fotoError.classList.add('is-visible');
      mark(fileInput, true);
    }

    mark(textarea, textarea.value.trim().length < MIN_DESC_LENGTH);

    kvkkError.classList.toggle('is-visible', !kvkk.checked);
    if (!kvkk.checked && !firstInvalid) firstInvalid = kvkk;

    return firstInvalid;
  };

  // Clear an error as soon as the user fixes the field
  form.addEventListener('input', (e) => {
    if (e.target.name === 'tur' || e.target.value?.trim()) setError(e.target, false);
    if (e.target === kvkk && kvkk.checked) kvkkError.classList.remove('is-visible');
  });
  form.addEventListener('change', (e) => {
    if (e.target.tagName === 'SELECT' || e.target.name === 'tur') setError(e.target, false);
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const firstInvalid = validate();
    if (firstInvalid) {
      (fieldOf(firstInvalid) || firstInvalid).scrollIntoView({ behavior: 'smooth', block: 'center' });
      firstInvalid.focus({ preventScroll: true });
      return;
    }

    // Demo: collect the payload that a backend would receive
    const payload = Object.fromEntries(new FormData(form));
    payload.foto = files.map((f) => ({ ad: f.name, boyut: f.size, tur: f.type }));
    console.info('[KGTÜ Biogen] Gönderilecek veri (demo):', payload);

    document.getElementById('successName').textContent = payload.ad.trim();
    form.hidden = true;
    success.hidden = false;
    success.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });

  form.addEventListener('reset', () => {
    files = [];
    renderPreviews();
    form.querySelectorAll('.has-error').forEach((f) => f.classList.remove('has-error'));
    fotoError.classList.remove('is-visible');
    kvkkError.classList.remove('is-visible');
    setTimeout(updateCount);
  });

  document.getElementById('newEntry').addEventListener('click', () => {
    form.reset();
    success.hidden = true;
    form.hidden = false;
    form.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
}
