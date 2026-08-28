const transcript = [
  { text: '$ secret-injection-diff check . --baseline baseline.json', className: 'line-muted' },
  { text: '+ NPM_TOKEN -> github:job/verify/step/Publish package  [env:NPM_TOKEN]', className: 'line-add' },
  { text: '1 added, 0 removed', className: '' },
  { text: 'check failed: an undeclared recipient gained a secret name', className: 'line-add' },
  { text: 'exit 2', className: 'line-ok' }
];

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

if ('serviceWorker' in navigator && location.hostname !== '127.0.0.1') {
  window.addEventListener('load', () => navigator.serviceWorker.register('/sw.js').catch(() => {}));
}
