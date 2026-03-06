const path = location.pathname.split('/').pop() || 'index.html';

document.querySelectorAll('nav a').forEach((a) => {
  const href = a.getAttribute('href');
  if (href === path || (path === '' && href === 'index.html')) {
    a.classList.add('active');
  }
});

const revealTargets = document.querySelectorAll('section, .card, .highlight, .page-title');
revealTargets.forEach((el) => el.classList.add('reveal'));

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('show');
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12 }
);

revealTargets.forEach((el) => observer.observe(el));

const form = document.getElementById('consultation-form');
if (form) {
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const data = Object.fromEntries(fd.entries());
    const subject = encodeURIComponent(`Consultation Request - ${data.name}`);
    const body = encodeURIComponent(
      `Name: ${data.name}\nPhone: ${data.phone}\nEmail: ${data.email}\nCity: ${data.city}\nMessage: ${data.message}`
    );

    location.href = `mailto:contact@anooppareeklaw.com?subject=${subject}&body=${body}`;
    const status = document.getElementById('status');
    if (status) {
      status.textContent = 'Opening your email app to send request. For instant assistance, use WhatsApp.';
    }
  });
}
