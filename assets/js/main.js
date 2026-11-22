/* ==========================================================================
   Титан-1 — минимальный JavaScript без зависимостей.
   Только то, что нельзя сделать разметкой и CSS: мобильное меню, модальное
   окно, кнопка «наверх», галерея и отправка форм на почту.
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  initMobileMenu();
  initModal();
  initBackToTop();
  initForms();
  initGallery();
  initPhoneFields();
});

/** Мобильное меню: открывается по бургеру, закрывается по фону и Escape. */
function initMobileMenu() {
  const burger = document.querySelector("[data-menu-open]");
  const menu = document.querySelector("[data-menu]");
  const overlay = document.querySelector("[data-menu-overlay]");
  const close = document.querySelector("[data-menu-close]");
  if (!burger || !menu || !overlay) return;

  const setOpen = (open) => {
    menu.classList.toggle("is-open", open);
    overlay.classList.toggle("is-open", open);
    document.body.classList.toggle("is-locked", open);
    burger.setAttribute("aria-expanded", String(open));
  };

  burger.addEventListener("click", () => setOpen(true));
  overlay.addEventListener("click", () => setOpen(false));
  close?.addEventListener("click", () => setOpen(false));
  menu.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => setOpen(false)));
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") setOpen(false);
  });
}

/** Модальное окно «Оставьте заявку» на основе нативного <dialog>. */
function initModal() {
  const modal = document.querySelector("[data-modal]");
  if (!modal) return;

  document.querySelectorAll("[data-modal-open]").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.preventDefault();
      modal.showModal();
    });
  });

  modal.querySelectorAll("[data-modal-close]").forEach((button) => {
    button.addEventListener("click", () => modal.close());
  });

  // Клик по затемнению закрывает окно.
  modal.addEventListener("click", (event) => {
    if (event.target === modal) modal.close();
  });
}

/** Кнопка «наверх» появляется после 900 px прокрутки. */
function initBackToTop() {
  const button = document.querySelector("[data-to-top]");
  if (!button) return;

  const update = () => button.classList.toggle("is-visible", window.scrollY > 900);
  update();
  window.addEventListener("scroll", update, { passive: true });

  button.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

/* --------------------------------------------------------------------------
   Формы
   Статический сайт не имеет сервера, поэтому данные формы превращаются
   в письмо: пользователь попадает в свою почтовую программу с готовым
   письмом на info@titan-1.cc.cd. Никаких сторонних сервисов и запросов.
   -------------------------------------------------------------------------- */

function initForms() {
  document.querySelectorAll("form[data-mail-form]").forEach((form) => {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      if (!form.reportValidity()) return;

      const data = new FormData(form);
      const subject = String(data.get("_subject") || "Заявка с сайта Титан-1");
      const lines = [];

      data.forEach((value, key) => {
        if (key.startsWith("_") || !String(value).trim()) return;
        const label = form.querySelector(`[name="${key}"]`)?.dataset.label || key;
        lines.push(`${label}: ${value}`);
      });

      const body = lines.join("\n");
      const message = form.querySelector("[data-form-message]");
      if (message) {
        message.textContent = "Спасибо! Проверьте почтовую программу — письмо уже подготовлено.";
        message.hidden = false;
      }

      window.location.href =
        "mailto:info@titan-1.cc.cd?subject=" +
        encodeURIComponent(subject) +
        "&body=" +
        encodeURIComponent(body);
    });
  });
}

/** Простая галерея для страницы проекта: стрелки, точки и swipe. */
function initGallery() {
  const gallery = document.querySelector("[data-gallery]");
  if (!gallery) return;

  const track = gallery.querySelector("[data-gallery-track]");
  const slides = [...track.children];
  const dots = [...gallery.querySelectorAll("[data-gallery-dot]")];
  const prev = gallery.querySelector("[data-gallery-prev]");
  const next = gallery.querySelector("[data-gallery-next]");
  let index = 0;

  const show = (newIndex) => {
    index = (newIndex + slides.length) % slides.length;
    track.style.transform = `translateX(-${index * 100}%)`;
    dots.forEach((dot, i) => dot.classList.toggle("is-active", i === index));
  };

  prev?.addEventListener("click", () => show(index - 1));
  next?.addEventListener("click", () => show(index + 1));
  dots.forEach((dot, i) => dot.addEventListener("click", () => show(i)));

  let startX = 0;
  gallery.addEventListener("touchstart", (event) => { startX = event.touches[0].clientX; }, { passive: true });
  gallery.addEventListener("touchend", (event) => {
    const delta = event.changedTouches[0].clientX - startX;
    if (Math.abs(delta) > 50) show(index + (delta < 0 ? 1 : -1));
  }, { passive: true });

  show(0);
}

/** Мягкое форматирование телефона в полях ввода. */
function initPhoneFields() {
  document.querySelectorAll('input[type="tel"][data-phone]').forEach((input) => {
    input.addEventListener("input", () => {
      let digits = input.value.replace(/\D/g, "").slice(0, 11);
      if (digits.startsWith("8")) digits = "7" + digits.slice(1);
      if (!digits) {
        input.value = "";
        return;
      }
      if (digits.length === 1 && digits === "7") {
        input.value = "+7 ";
        return;
      }
      const rest = digits.startsWith("7") ? digits.slice(1) : digits;
      let out = "+7";
      if (rest.length) out += " (" + rest.slice(0, 3);
      if (rest.length >= 3) out += ")";
      if (rest.length > 3) out += " " + rest.slice(3, 6);
      if (rest.length > 6) out += "-" + rest.slice(6, 8);
      if (rest.length > 8) out += "-" + rest.slice(8, 10);
      input.value = out;
    });
  });
}
