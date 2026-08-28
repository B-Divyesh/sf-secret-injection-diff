const transcript = [
  { text: '$ secret-injection-diff check . --baseline baseline.json', className: 'line-muted' },
  { text: '+ NPM_TOKEN -> github:job/verify/step/Publish package  [env:NPM_TOKEN]', className: 'line-add' },
  { text: '1 process added, 0 removed; 0 injection paths changed', className: '' },
  { text: 'check failed: an unapproved process gained a secret name', className: 'line-add' },
  { text: 'exit 2', className: 'line-ok' }
];

const query = new window.URLSearchParams(window.location.search);
if (query.get('demo') === '1' && !window.location.pathname.startsWith('/demo')) {
  window.location.replace('/demo/?demo=1');
}

const routeStatus = document.createElement('p');
routeStatus.className = 'visually-hidden';
routeStatus.dataset.routeStatus = '';
routeStatus.setAttribute('role', 'status');
routeStatus.setAttribute('aria-live', 'polite');
document.body.append(routeStatus);

const focusDestination = () => {
  const destination = window.location.hash ? document.querySelector(window.location.hash) : null;
  const heading = destination
    ? (destination.matches('h1, h2, h3') ? destination : destination.querySelector('h1, h2, h3'))
    : document.querySelector('main h1');
  if (!heading) return;
  heading.setAttribute('tabindex', '-1');
  heading.focus({ preventScroll: Boolean(destination) });
  routeStatus.textContent = destination
    ? `${heading.textContent.trim()} section`
    : heading.textContent.trim();
};

window.addEventListener('hashchange', () => window.requestAnimationFrame(focusDestination));
// `pageshow` also fires when a page is restored from the back/forward cache.
// This keeps a full-document route change equivalent to an in-page route change.
window.addEventListener('pageshow', () => window.requestAnimationFrame(focusDestination));

const renderTranscript = (target, animate = false) => {
  if (!target) return;
  target.textContent = '';
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  transcript.forEach((item, index) => {
    window.setTimeout(() => {
      const line = document.createElement('span');
      line.className = item.className;
      line.textContent = `${item.text}\n`;
      target.append(line);
    }, animate && !reduced ? index * 430 : 0);
  });
};

document.querySelectorAll('[data-terminal]').forEach(target => renderTranscript(target));

document.querySelectorAll('[data-replay]').forEach(button => {
  button.addEventListener('click', () => {
    renderTranscript(document.querySelector('[data-terminal]'), true);
    const status = document.querySelector('[data-demo-status]');
    if (status) status.textContent = 'Recorded check restarted.';
  });
});

document.querySelectorAll('[data-reset]').forEach(button => {
  button.addEventListener('click', () => {
    renderTranscript(document.querySelector('[data-terminal]'));
    const status = document.querySelector('[data-demo-status]');
    if (status) status.textContent = 'Demo reset. Sample data is ready.';
  });
});

document.querySelectorAll('[data-copy]').forEach(button => {
  button.addEventListener('click', async () => {
    const value = button.getAttribute('data-copy');
    const status = document.querySelector('[data-copy-status]');
    try {
      await navigator.clipboard.writeText(value);
      if (status) status.textContent = 'Install command copied.';
    } catch {
      if (status) status.textContent = 'Copy failed. Select the command and copy it.';
    }
  });
});
