// The site's 3.5" floppy, copied from option-a-desktop/app.js (floppySVG, which the About window no longer shows) so the
// share card can lay one on the desk. window.floppySVG(label, vol) -> svg markup; its type is style.css's .floppy-art
(() => {
  const esc = (v) => String(v).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const FLOPPY_GRAIN = [[3.9, 30, 58, 1], [5.1, 44, 44, 0], [6.6, 28, 40, 1], [7.4, 61, 29, 0], [9.2, 33, 51, 1], [10.7, 28, 23, 0],
    [11.9, 50, 40, 1], [13.6, 36, 30, 0], [15.1, 28, 62, 1], [16.8, 57, 33, 0], [18.3, 31, 38, 1], [19.9, 44, 46, 0], [21.4, 28, 27, 1],
    [22.8, 62, 28, 0], [24.5, 35, 47, 1], [26.1, 28, 34, 0], [27.4, 51, 39, 1], [29.2, 30, 60, 0], [30.9, 46, 25, 1], [32.3, 28, 44, 0],
    [33.8, 58, 32, 1], [35.6, 32, 41, 0], [37.2, 28, 62, 1], [38.9, 48, 42, 0]]
    .map(([y, x, w, lit]) => `<rect x="${x}" y="${y}" width="${Math.min(w, 90 - x)}" height=".3" fill="${lit ? '#fff' : '#2e3442'}" opacity="${lit ? .38 : .14}"/>`).join('');
  function floppySVG(label, vol) {
    const body = 'M5 2h101l12 12v104a4 4 0 0 1-4 4H5a4 4 0 0 1-4-4V6a4 4 0 0 1 4-4z';
    const shutter = 'M28 2h62v38.6a1.4 1.4 0 0 1-1.4 1.4H29.4a1.4 1.4 0 0 1-1.4-1.4z';
    return `<svg class="floppy-art" viewBox="0 0 120 124" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="fl-body" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#28375f"/><stop offset=".45" stop-color="#1b2744"/><stop offset="1" stop-color="#131b32"/></linearGradient>
        <linearGradient id="fl-gloss" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".07"/><stop offset=".35" stop-color="#fff" stop-opacity=".02"/><stop offset=".5" stop-color="#fff" stop-opacity="0"/></linearGradient>
        <linearGradient id="fl-foot" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#040a18" stop-opacity="0"/><stop offset="1" stop-color="#040a18" stop-opacity=".4"/></linearGradient>
        <linearGradient id="fl-wall" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#050a16" stop-opacity=".45"/><stop offset="1" stop-color="#050a16" stop-opacity="0"/></linearGradient>
        <linearGradient id="fl-lip" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#050a16" stop-opacity=".55"/><stop offset="1" stop-color="#050a16" stop-opacity="0"/></linearGradient>
        <linearGradient id="fl-metal" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f3f4f7"/><stop offset=".4" stop-color="#d4d7de"/><stop offset="1" stop-color="#b3b8c2"/></linearGradient>
        <linearGradient id="fl-sheen" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".3" stop-color="#fff" stop-opacity=".4"/><stop offset=".5" stop-color="#fff" stop-opacity="0"/><stop offset=".68" stop-color="#282c3c" stop-opacity=".1"/><stop offset=".9" stop-color="#fff" stop-opacity=".28"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
        <linearGradient id="fl-paper" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fbf9f2"/><stop offset="1" stop-color="#f2eee2"/></linearGradient>
        <clipPath id="fl-cut"><path clip-rule="evenodd" d="${body}M109 112v5.5h5.5V112z"/></clipPath>
      </defs>
      <g clip-path="url(#fl-cut)">
        <path d="${body}" fill="url(#fl-body)"/>
        <path d="${body}" fill="url(#fl-gloss)"/>
        <rect x="1" y="100" width="118" height="22" fill="url(#fl-foot)"/>
        <path d="M5 2.6h100.8l11.6 11.6" fill="none" stroke="#fff" stroke-opacity=".22" stroke-width=".9"/>
        <path d="M1.6 6v112" fill="none" stroke="#fff" stroke-opacity=".08" stroke-width=".9"/>
        <rect x="12" y="2" width="16" height="39" fill="#050a16" opacity=".16"/>
        <rect x="12" y="2" width="3" height="39" fill="url(#fl-wall)"/>
        <rect x="12" y="40.5" width="16" height=".5" fill="#fff" opacity=".1"/>
        <path d="M7 7.5l3.2 5.2H3.8z" fill="#3a4b7b"/>
        <rect x="28" y="42" width="62" height="2.2" fill="url(#fl-lip)"/>
        <path d="${shutter}" fill="url(#fl-metal)"/>
        ${FLOPPY_GRAIN}
        <path d="${shutter}" fill="url(#fl-sheen)"/>
        <rect x="28" y="2" width="62" height="1" fill="#fff" opacity=".9"/>
        <rect x="28" y="3" width="62" height="1.6" fill="#fff" opacity=".35"/>
        <path d="M28.3 2v38.6" stroke="#fff" stroke-opacity=".5" stroke-width=".6"/>
        <path d="M89.7 2v38.6M29.4 41.7h59.2" fill="none" stroke="#6f747e" stroke-opacity=".7" stroke-width=".6"/>
        <rect x="70" y="9" width="12" height="27" rx="1.4" fill="#0f172d"/>
        <rect x="70" y="9" width="12" height="4" rx="1.4" fill="url(#fl-lip)"/>
        <rect x="70" y="9" width="1.1" height="27" fill="#050a16" opacity=".4"/>
        <path d="M71.2 35.7h9.6" stroke="#fff" stroke-opacity=".75" stroke-width=".6"/>
        <rect x="14" y="116" width="94" height="1" fill="#050a16" opacity=".4"/>
        <rect x="107" y="55" width=".9" height="61.6" fill="#050a16" opacity=".35"/>
        <rect x="13" y="54" width="94" height="62" rx="2" fill="url(#fl-paper)" stroke="#141008" stroke-opacity=".14" stroke-width=".5"/>
        <path d="M13 56a2 2 0 0 1 2-2h90a2 2 0 0 1 2 2v7H13z" fill="#d4441d"/>
        <rect x="13" y="62.5" width="94" height=".5" fill="#9c2f10" opacity=".55"/>
        <text class="fl-hd" x="19" y="60.8">HD</text>
        <text class="fl-hd" x="101" y="60.8" text-anchor="end">1.44 MB</text>
        <g fill="#b9b6ab"><rect x="19" y="84" width="82" height="1"/><rect x="19" y="97" width="82" height="1"/><rect x="19" y="110" width="82" height="1"/></g>
        <text class="fl-t1" x="19" y="82.6">${esc(label)}</text>
        <text class="fl-t2" x="19" y="95.6">${esc(vol)}</text>
        <rect x="5.5" y="112" width="5.5" height="5.5" fill="#18213b"/>
        <rect x="5.5" y="112" width="5.5" height="1.6" fill="#050a16" opacity=".7"/>
        <rect x="5.5" y="112" width="1.1" height="5.5" fill="#050a16" opacity=".5"/>
      </g>
      <path d="${body}" fill="none" stroke="#0b1226" stroke-width="1.2"/>
      <path d="M109 112h5.5v5.5H109zM5.5 112H11v5.5H5.5z" fill="none" stroke="#0b1226" stroke-width=".6"/>
    </svg>`;
  }
  window.floppySVG = floppySVG;
})();
