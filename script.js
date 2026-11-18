const toggle = document.querySelector('.menu-toggle');
const links = document.querySelector('.nav-links');
toggle.addEventListener('click', () => {
  const open = links.classList.toggle('open');
  toggle.setAttribute('aria-expanded', String(open));
  toggle.textContent = open ? '×' : '☰';
});
links.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
  links.classList.remove('open');
  toggle.setAttribute('aria-expanded', 'false');
  toggle.textContent = '☰';
}));
document.getElementById('year').textContent = new Date().getFullYear();

document.getElementById('contactForm').addEventListener('submit', event => {
  event.preventDefault();
  const data = new FormData(event.currentTarget);
  const subject = encodeURIComponent(`Website enquiry: ${data.get('service')}`);
  const body = encodeURIComponent(
    `Name: ${data.get('name')}\nReply contact: ${data.get('reply')}\nService: ${data.get('service')}\n\nMessage:\n${data.get('message')}`
  );
  // Replace YOUR_EMAIL@example.com with the business email before publishing.
  window.location.href = `mailto:YOUR_EMAIL@example.com?subject=${subject}&body=${body}`;
});
