// Shared by About and the standalone Tempa page. Delivery uses the existing message endpoint.
const COPY = {
  en: {
    title: 'Request access', lead: 'Want to take a closer look at Tempa 3D?',
    note: 'This project is still in development. Send a request for Iqbal to review; access is not granted automatically.',
    to: 'To', name: 'Your name', email: 'Your email', reason: 'Why would you like access?',
    placeholder: 'Tell me what you would like to explore or try.',
    send: 'Send request', sending: 'Sending request…', cancel: 'Cancel', close: 'Close',
    received: 'Request received', receivedNote: 'Your request has been submitted to Iqbal. Any reply will go to',
    failed: 'Delivery could not be confirmed. Your form is still here. Try again or send it from your email app.',
    badEmail: 'Check your email address. This address cannot receive replies.',
    suggestion: 'Did you mean', use: 'Use this address', required: 'Please enter your name and a reason for requesting access.',
    emailApp: 'Open email draft', draftNote: 'Send the draft from your email app to complete your request.',
    subject: 'Tempa 3D access request', nameLine: 'Name', reasonLine: 'Reason for requesting access',
  },
  id: {
    title: 'Minta akses', lead: 'Ingin melihat Tempa 3D lebih lanjut?',
    note: 'Proyek ini masih dikembangkan. Kirim permintaan untuk ditinjau Iqbal; akses tidak diberikan secara otomatis.',
    to: 'Kepada', name: 'Nama Anda', email: 'Email Anda', reason: 'Mengapa Anda ingin mendapatkan akses?',
    placeholder: 'Ceritakan apa yang ingin Anda lihat atau coba.',
    send: 'Kirim permintaan', sending: 'Mengirim permintaan…', cancel: 'Batal', close: 'Tutup',
    received: 'Permintaan diterima', receivedNote: 'Permintaan Anda sudah dikirim untuk ditinjau Iqbal. Balasan akan ditujukan ke',
    failed: 'Pengiriman belum bisa dikonfirmasi. Isian Anda tetap tersimpan di form ini. Coba lagi atau kirim lewat aplikasi email.',
    badEmail: 'Periksa alamat email Anda. Alamat ini tidak bisa menerima balasan.',
    suggestion: 'Maksud Anda', use: 'Pakai alamat ini', required: 'Isi nama dan alasan meminta akses terlebih dahulu.',
    emailApp: 'Buka draf email', draftNote: 'Kirim draf dari aplikasi email Anda untuk menyelesaikan permintaan.',
    subject: 'Permintaan akses Tempa 3D', nameLine: 'Nama', reasonLine: 'Alasan meminta akses',
  },
};
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
let active = null;
let styles = null;
function loadStyles() {
  const sheet = (file) => new Promise((resolve, reject) => {
    const link = document.createElement('link');
    link.rel = 'stylesheet'; link.href = new URL(file, import.meta.url).href;
    link.onload = resolve;
    link.onerror = () => { link.remove(); reject(new Error('Access form styles unavailable')); };
    document.head.append(link);
  });
  if (!styles) styles = (async () => {
    // The desktop already has these tokens and controls; load them once on standalone pages.
    if (!getComputedStyle(document.documentElement).getPropertyValue('--cap').trim()) await sheet('./xp-system.css?v=2');
    await sheet('./access-request.css?v=3');
  })().catch((error) => { styles = null; throw error; });
  return styles;
}

export async function openAccessRequest({ lang = document.documentElement.lang, email = 'hello@iqbalsurya.com' } = {}) {
  await loadStyles();
  if (active) { active.focus(); return; }
  lang = lang === 'id' ? 'id' : 'en';
  const c = COPY[lang], returnTo = document.activeElement;
  const icon = (name, size) => window.PXI.svg(name, size);
  const dialog = document.createElement('dialog');
  dialog.className = 'access-dialog'; dialog.lang = lang;
  dialog.setAttribute('aria-labelledby', 'access-title');
  dialog.setAttribute('aria-describedby', 'access-note');
  dialog.innerHTML = `
    <header class="access-bar title"><span class="t-ico">${icon('envelope', 16)}</span><h2 id="access-title" class="t-text">${esc(c.title)} — Tempa 3D</h2><span class="t-btns"><button type="button" class="access-x tb close" aria-label="${esc(c.close)}"><svg width="11" height="11" viewBox="0 0 11 11" aria-hidden="true"><path d="M2 2l7 7M9 2l-7 7" stroke="currentColor" stroke-width="2" stroke-linecap="square"/></svg></button></span></header>
    <div class="access-body">
      <p class="access-lead">${esc(c.lead)}</p><p id="access-note" class="access-note">${esc(c.note)}</p>
      <div class="access-to"><span>${esc(c.to)}</span><b>${esc(email)}</b></div>
      <form class="access-form">
        <label for="access-name">${esc(c.name)}</label><input id="access-name" class="field" name="name" autocomplete="name" required maxlength="120">
        <label for="access-email">${esc(c.email)}</label><input id="access-email" class="field" name="from" type="email" autocomplete="email" required maxlength="200">
        <label for="access-reason">${esc(c.reason)}</label><textarea id="access-reason" class="field" name="reason" rows="4" required maxlength="4000" placeholder="${esc(c.placeholder)}"></textarea>
        <div class="access-trap" aria-hidden="true"><label>Website<input name="website" autocomplete="off" tabindex="-1"></label></div>
        <div class="access-status" role="status" aria-live="polite" aria-atomic="true"></div>
        <button type="button" class="access-fix btn" hidden>${esc(c.use)}</button>
        <div class="access-fallback" hidden><a class="access-draft">${esc(c.emailApp)} ↗</a><small>${esc(c.draftNote)}</small></div>
        <div class="access-actions"><button type="button" class="access-cancel btn">${esc(c.cancel)}</button><button type="submit" class="access-send btn default">${icon('envelope', 16)}<span>${esc(c.send)}</span></button></div>
      </form>
      <div class="access-success" hidden><div class="access-result"><span class="access-check" aria-hidden="true">${icon('check', 32)}</span><div><h3>${esc(c.received)}</h3><p>${esc(c.receivedNote)} <b class="access-reply"></b>.</p></div></div><div class="access-actions"><button type="button" class="access-done btn default">${esc(c.close)}</button></div></div>
    </div>`;
  document.body.append(dialog); active = dialog;
  const form = dialog.querySelector('form'), status = dialog.querySelector('.access-status');
  const send = dialog.querySelector('.access-send'), fallback = dialog.querySelector('.access-fallback');
  const fix = dialog.querySelector('.access-fix');
  const fields = ['name', 'from', 'reason'].map((n) => form.elements[n]);
  let busy = false, suggested = '', askedEmail = '';
  const close = () => { if (!busy) dialog.close(); };
  dialog.querySelector('.access-x').onclick = close;
  dialog.querySelector('.access-cancel').onclick = close;
  dialog.querySelector('.access-done').onclick = close;
  dialog.addEventListener('cancel', (event) => { if (busy) event.preventDefault(); });
  dialog.addEventListener('close', () => { active = null; dialog.remove(); if (returnTo?.isConnected) returnTo.focus(); });
  // Keep app shortcuts and window-manager key handlers outside this native modal.
  dialog.addEventListener('keydown', (event) => {
    event.stopPropagation();
    if (event.key !== 'Tab') return;
    const controls = [...dialog.querySelectorAll('button, input, textarea, a[href]')].filter((el) => !el.disabled && el.getClientRects().length && el.tabIndex >= 0 && !el.closest('[aria-hidden="true"]'));
    const first = controls[0], last = controls.at(-1);
    if ((event.shiftKey && document.activeElement === first) || (!event.shiftKey && document.activeElement === last)) {
      event.preventDefault(); (event.shiftKey ? last : first).focus();
    }
  });
  function setBusy(value) {
    busy = value; form.setAttribute('aria-busy', String(value));
    send.setAttribute('aria-disabled', String(value)); send.querySelector('span').textContent = value ? c.sending : c.send;
    fields.forEach((field) => { field.readOnly = value; });
    dialog.querySelectorAll('.access-x, .access-cancel').forEach((button) => button.setAttribute('aria-disabled', String(value)));
  }
  function draft() {
    const message = `${c.nameLine}: ${form.elements.name.value.trim()}\nEmail: ${form.elements.from.value.trim()}\nProject: Tempa 3D\n\n${c.reasonLine}:\n${form.elements.reason.value.trim()}`;
    dialog.querySelector('.access-draft').href = `mailto:${email}?subject=${encodeURIComponent(c.subject)}&body=${encodeURIComponent(message)}`;
    return message;
  }
  form.addEventListener('input', () => {
    if (busy) return;
    status.textContent = ''; delete status.dataset.error; fix.hidden = true;
    fields.forEach((field) => field.removeAttribute('aria-invalid'));
    if (!fallback.hidden) draft();
  });
  fix.onclick = () => { form.elements.from.value = suggested; askedEmail = ''; fix.hidden = true; status.textContent = ''; form.elements.from.removeAttribute('aria-invalid'); form.elements.from.focus(); };
  form.addEventListener('submit', async (event) => {
    event.preventDefault(); if (busy) return;
    if (!form.reportValidity()) return;
    const from = form.elements.from.value.trim();
    const empty = [form.elements.name, form.elements.reason].find((field) => !field.value.trim());
    if (empty) { status.textContent = c.required; status.dataset.error = 'true'; empty.setAttribute('aria-invalid', 'true'); empty.focus(); return; }
    const message = draft();
    fallback.hidden = true; fix.hidden = true; delete status.dataset.error; status.textContent = c.sending;
    setBusy(true);
    let response = null, result = null;
    try {
      response = await fetch('/api/message', {
        method: 'POST', headers: { 'content-type': 'application/json' }, signal: AbortSignal.timeout(15000),
        body: JSON.stringify({ from, subject: c.subject, message, lang, website: form.elements.website.value, sure: askedEmail === from }),
      });
      result = await response.json();
    } catch { /* Keep the visitor's draft and offer an explicit email fallback. */ }
    setBusy(false);
    if (response?.ok && result?.sent === true) {
      form.hidden = true;
      const success = dialog.querySelector('.access-success'); success.hidden = false;
      dialog.querySelector('.access-reply').textContent = from;
      success.setAttribute('role', 'status'); dialog.querySelector('.access-done').focus();
      return;
    }
    status.dataset.error = 'true';
    if (response?.status === 422 && result?.error === 'from') {
      form.elements.from.setAttribute('aria-invalid', 'true');
      if (typeof result.suggest === 'string') {
        suggested = result.suggest; askedEmail = from;
        status.textContent = `${c.suggestion} ${suggested}?`; fix.hidden = false;
      } else { status.textContent = c.badEmail; }
      form.elements.from.focus();
      return;
    }
    status.textContent = c.failed; fallback.hidden = false;
  });
  dialog.showModal();
  form.elements.name.focus();
}

// The standalone project page uses the same form; the desktop imports it on demand.
document.addEventListener('click', (event) => {
  const link = event.target.closest?.('[data-request-access]');
  if (!link) return;
  event.preventDefault();
  openAccessRequest().catch(() => { window.location.href = link.href; });
});
