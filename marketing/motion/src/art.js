/* Illustrations drawn in code for posts that would otherwise need stock
 * photos. Figures are faceless, like the figure in the logo: they read as
 * "a person" without pretending to be a real patient or a real nurse. */
(function () {
  'use strict';
  const TX = window.TX;
  const A = (TX.art = {});

  const SKIN = '#C98E6E', SKIN_D = '#A9715A', SKIN_L = '#DDA888';

  /** An older woman's hands holding an istikan of tea on its saucer, warm light. */
  A.istikan = () => `<svg viewBox="0 0 800 640" width="100%" height="100%">
    <defs>
      <radialGradient id="warm" cx="50%" cy="46%" r="52%">
        <stop offset="0" stop-color="#FFC98A" stop-opacity=".55"/>
        <stop offset=".45" stop-color="#FF9E6B" stop-opacity=".18"/>
        <stop offset="1" stop-color="#181943" stop-opacity="0"/>
      </radialGradient>
      <linearGradient id="tea" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#E0883E"/>
        <stop offset=".55" stop-color="#B94A22"/>
        <stop offset="1" stop-color="#7E2A14"/>
      </linearGradient>
      <clipPath id="glass"><path d="M318 176 C330 246 360 268 360 302 C360 336 338 364 336 404 L464 404 C462 364 440 336 440 302 C440 268 470 246 482 176 Z"/></clipPath>
      <pattern id="dots" width="26" height="26" patternUnits="userSpaceOnUse">
        <rect width="26" height="26" fill="#2A2D72"/>
        <circle cx="7" cy="7" r="3.2" fill="#1B9CCE" opacity=".55"/>
        <circle cx="20" cy="19" r="2.4" fill="#FFFEFF" opacity=".35"/>
      </pattern>
    </defs>
    <rect width="800" height="640" fill="url(#warm)"/>
    <g fill="none" stroke="#FFFEFF" stroke-linecap="round" stroke-width="6" opacity=".5">
      <path d="M370 150 C352 120 392 102 374 70"/>
      <path d="M406 156 C388 118 430 96 410 56" opacity=".7"/>
      <path d="M440 150 C424 124 458 108 444 80" opacity=".55"/>
    </g>
    <!-- sleeves and palms, under the saucer -->
    <path d="M-20 640 L-20 520 C40 470 120 452 190 470 L236 560 C160 590 80 620 40 640 Z" fill="url(#dots)"/>
    <path d="M820 640 L820 520 C760 470 680 452 610 470 L564 560 C640 590 720 620 760 640 Z" fill="url(#dots)"/>
    <path d="M176 470 C220 448 290 440 340 452 C360 458 366 474 354 486 C318 520 262 548 222 556 C196 560 176 546 170 526 C164 506 164 482 176 470 Z" fill="${SKIN}"/>
    <path d="M624 470 C580 448 510 440 460 452 C440 458 434 474 446 486 C482 520 538 548 578 556 C604 560 624 546 630 526 C636 506 636 482 624 470 Z" fill="${SKIN}"/>
    <path d="M190 520 C230 530 280 522 330 494" fill="none" stroke="${SKIN_D}" stroke-width="5" stroke-linecap="round" opacity=".6"/>
    <path d="M610 520 C570 530 520 522 470 494" fill="none" stroke="${SKIN_D}" stroke-width="5" stroke-linecap="round" opacity=".6"/>
    <!-- saucer -->
    <ellipse cx="400" cy="420" rx="176" ry="34" fill="#FFFEFF"/>
    <ellipse cx="400" cy="414" rx="128" ry="20" fill="#E8ECF6"/>
    <ellipse cx="400" cy="420" rx="176" ry="34" fill="none" stroke="#1B9CCE" stroke-width="5"/>
    <!-- istikan: tea inside the waisted glass -->
    <g clip-path="url(#glass)">
      <rect x="300" y="198" width="200" height="220" fill="url(#tea)"/>
      <rect x="300" y="198" width="200" height="10" fill="#F2A661" opacity=".8"/>
      <path d="M338 214 C348 262 370 282 370 304 C370 330 352 356 350 390" fill="none" stroke="#FFFEFF" stroke-width="9" stroke-linecap="round" opacity=".35"/>
    </g>
    <path d="M318 176 C330 246 360 268 360 302 C360 336 338 364 336 404 L464 404 C462 364 440 336 440 302 C440 268 470 246 482 176 Z" fill="none" stroke="#FFFEFF" stroke-width="5" stroke-linejoin="round" opacity=".92"/>
    <ellipse cx="400" cy="176" rx="82" ry="9" fill="none" stroke="#FFFEFF" stroke-width="4" opacity=".9"/>
    <!-- fingertips curling up around the saucer's underside -->
    <g fill="${SKIN}" stroke="${SKIN_D}" stroke-width="3">
      <rect x="318" y="446" width="30" height="46" rx="15" transform="rotate(-24 333 469)"/>
      <rect x="290" y="458" width="30" height="50" rx="15" transform="rotate(-30 305 483)"/>
      <rect x="452" y="446" width="30" height="46" rx="15" transform="rotate(24 467 469)"/>
      <rect x="480" y="458" width="30" height="50" rx="15" transform="rotate(30 495 483)"/>
    </g>
    <!-- thumbs over the saucer rim, with nails -->
    <path d="M286 440 C300 408 334 396 360 404 C376 409 374 428 356 434 C336 440 318 452 304 466 C292 462 282 454 286 440 Z" fill="${SKIN_L}" stroke="${SKIN_D}" stroke-width="3"/>
    <ellipse cx="350" cy="414" rx="11" ry="7" fill="#F2CDB6" transform="rotate(-12 350 414)"/>
    <path d="M514 440 C500 408 466 396 440 404 C424 409 426 428 444 434 C464 440 482 452 496 466 C508 462 518 454 514 440 Z" fill="${SKIN_L}" stroke="${SKIN_D}" stroke-width="3"/>
    <ellipse cx="450" cy="414" rx="11" ry="7" fill="#F2CDB6" transform="rotate(12 450 414)"/>
    <!-- a thin gold-free ring, the only jewellery -->
    <circle cx="262" cy="500" r="8" fill="#1B9CCE"/>
  </svg>`;

  /** A nurse with the pink lanyard sitting with an older man in his living room. */
  A.visit = () => `<svg viewBox="0 0 900 620" width="100%" height="100%">
    <defs>
      <radialGradient id="lamp" cx="22%" cy="30%" r="60%">
        <stop offset="0" stop-color="#FFD8A8" stop-opacity=".35"/>
        <stop offset="1" stop-color="#181943" stop-opacity="0"/>
      </radialGradient>
      <linearGradient id="win" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#2C6FA0"/>
        <stop offset="1" stop-color="#7FC3E3"/>
      </linearGradient>
    </defs>
    <rect x="0" y="0" width="900" height="620" rx="44" fill="#20225A"/>
    <rect x="0" y="0" width="900" height="620" rx="44" fill="url(#lamp)"/>
    <!-- window with a palm in the courtyard -->
    <rect x="600" y="60" width="210" height="230" rx="100" fill="url(#win)"/>
    <path d="M705 290 C700 230 708 190 716 150" stroke="#16335A" stroke-width="10" fill="none" stroke-linecap="round"/>
    <path d="M716 150 C690 130 660 132 640 146 M716 150 C730 124 760 118 784 130 M716 150 C700 120 704 96 716 80 M716 150 C744 150 770 166 780 186 M716 150 C690 158 668 178 662 198" stroke="#16335A" stroke-width="9" fill="none" stroke-linecap="round"/>
    <rect x="600" y="60" width="210" height="230" rx="100" fill="none" stroke="#FFFEFF" stroke-width="8" opacity=".85"/>
    <path d="M705 60 V290 M600 180 H810" stroke="#FFFEFF" stroke-width="5" opacity=".6"/>
    <!-- rug -->
    <path d="M60 560 H840 L800 610 H100 Z" fill="#2E3278"/>
    <path d="M150 585 H750" stroke="#1B9CCE" stroke-width="6" stroke-dasharray="18 14" opacity=".8"/>
    <!-- sofa -->
    <rect x="70" y="300" width="420" height="190" rx="46" fill="#3A3F8F"/>
    <rect x="50" y="380" width="460" height="140" rx="40" fill="#4349A0"/>
    <rect x="70" y="510" width="26" height="46" rx="10" fill="#2A2E70"/>
    <rect x="464" y="510" width="26" height="46" rx="10" fill="#2A2E70"/>
    <!-- older man, seated: white hair, light dishdasha -->
    <path d="M200 520 C196 440 210 380 260 360 C300 346 340 360 356 392 C372 426 372 480 368 520 Z" fill="#D9DCEA"/>
    <circle cx="282" cy="298" r="50" fill="${SKIN}"/>
    <path d="M234 290 C236 250 262 236 286 238 C312 240 332 256 332 286 C320 268 300 262 280 262 C262 262 246 272 234 290 Z" fill="#F1F1F6"/>
    <path d="M356 404 C392 420 420 438 444 452" stroke="#D9DCEA" stroke-width="44" stroke-linecap="round" fill="none"/>
    <circle cx="452" cy="456" r="22" fill="${SKIN}"/>
    <!-- blood-pressure cuff on his arm -->
    <rect x="378" y="404" width="54" height="50" rx="12" fill="#1B9CCE" transform="rotate(24 405 429)"/>
    <!-- side table with tea -->
    <rect x="520" y="440" width="120" height="16" rx="8" fill="#6A4B3A"/>
    <rect x="570" y="456" width="20" height="100" rx="8" fill="#5A3E30"/>
    <path d="M556 402 C560 418 568 424 568 430 C568 436 562 440 562 444 L586 444 C586 440 580 436 580 430 C580 424 588 418 592 402 Z" fill="#C0582A" stroke="#FFFEFF" stroke-width="2.5"/>
    <ellipse cx="574" cy="446" rx="30" ry="6" fill="#FFFEFF"/>
    <!-- nurse, seated on a stool, leaning in: headscarf, blue scrubs, pink lanyard -->
    <rect x="690" y="470" width="120" height="22" rx="11" fill="#2A2E70"/>
    <rect x="740" y="492" width="22" height="66" rx="8" fill="#2A2E70"/>
    <path d="M660 480 C650 410 668 352 716 334 C758 320 800 338 812 378 C824 420 820 460 816 484 Z" fill="#1B9CCE"/>
    <circle cx="740" cy="276" r="52" fill="${SKIN}"/>
    <path d="M684 284 C678 230 710 204 744 204 C782 204 806 234 800 284 C796 316 782 340 766 350 C780 322 784 296 774 276 C762 254 722 252 706 276 C698 290 698 316 712 344 C694 330 686 308 684 284 Z" fill="#23255E"/>
    <path d="M676 380 C630 396 590 420 548 450" stroke="#1B9CCE" stroke-width="40" stroke-linecap="round" fill="none"/>
    <circle cx="540" cy="452" r="21" fill="${SKIN}"/>
    <path d="M718 336 L740 404 L762 336" stroke="#EE396B" stroke-width="9" fill="none" stroke-linejoin="round"/>
    <rect x="722" y="402" width="36" height="46" rx="7" fill="#FFFEFF"/>
    <rect x="730" y="412" width="20" height="4" rx="2" fill="#1B9CCE"/>
  </svg>`;

  /** Baghdad at dusk on the Tigris: Baghdad Tower, the suspension bridge,
   * palms and shanasheel houses. No monuments with political meaning. */
  A.baghdad = () => {
    const stars = Array.from({ length: 26 }, (_, i) => {
      const r = TX.rng(i + 11);
      return `<circle cx="${(r() * 1080).toFixed(0)}" cy="${(r() * 250).toFixed(0)}" r="${(1.2 + r() * 1.8).toFixed(1)}" fill="#FFFEFF" opacity="${(0.25 + r() * 0.5).toFixed(2)}"/>`;
    }).join('');
    const palm = (x, y, s) => `<g transform="translate(${x} ${y}) scale(${s})">
        <path d="M0 0 C-4 -60 4 -120 10 -170" stroke="#0E0F2B" stroke-width="12" fill="none" stroke-linecap="round"/>
        <path d="M10 -170 C-20 -190 -54 -186 -76 -168 M10 -170 C24 -200 58 -206 84 -190 M10 -170 C-6 -204 0 -232 16 -250 M10 -170 C44 -170 72 -150 84 -126 M10 -170 C-22 -160 -46 -138 -54 -114" stroke="#0E0F2B" stroke-width="11" fill="none" stroke-linecap="round"/>
      </g>`;
    const house = (x, w, h) => {
      let win = '';
      for (let wx = x + 18; wx < x + w - 30; wx += 44) win += `<rect x="${wx}" y="${560 - h + 28}" width="26" height="34" rx="6" fill="#FFC98A" opacity=".55"/>`;
      return `<rect x="${x}" y="${560 - h}" width="${w}" height="${h}" fill="#0E0F2B"/>
        <rect x="${x + 10}" y="${560 - h + 14}" width="${w - 20}" height="58" rx="6" fill="#151744"/>${win}`;
    };
    return `<svg viewBox="0 0 1080 700" width="100%" height="100%">
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#181943" stop-opacity="0"/>
          <stop offset=".55" stop-color="#2B2F7A"/>
          <stop offset=".86" stop-color="#5B4E9A"/>
          <stop offset="1" stop-color="#8E6FA8"/>
        </linearGradient>
        <linearGradient id="river" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#1B3E78"/>
          <stop offset="1" stop-color="#111233"/>
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="1080" height="560" fill="url(#sky)"/>
      ${stars}
      <!-- Baghdad Tower, on the left so the headline never sits on it -->
      <path d="M268 560 L280 250 L296 250 L308 560 Z" fill="#0E0F2B"/>
      <rect x="260" y="214" width="56" height="44" rx="18" fill="#0E0F2B"/>
      <rect x="268" y="186" width="40" height="30" rx="12" fill="#0E0F2B"/>
      <path d="M288 186 V92" stroke="#0E0F2B" stroke-width="6"/>
      <rect x="274" y="226" width="28" height="8" rx="4" fill="#FFC98A" opacity=".7"/>
      ${house(20, 190, 160)}${house(700, 140, 118)}${house(860, 210, 168)}
      ${palm(170, 560, 0.9)}${palm(410, 560, 1.0)}${palm(1010, 560, 0.75)}
      <!-- suspension bridge -->
      <rect x="500" y="400" width="18" height="160" fill="#0E0F2B"/>
      <rect x="660" y="400" width="18" height="160" fill="#0E0F2B"/>
      <path d="M400 520 Q509 470 509 404 Q589 500 669 404 Q669 470 790 520" stroke="#0E0F2B" stroke-width="6" fill="none"/>
      <rect x="370" y="520" width="440" height="16" fill="#0E0F2B"/>
      <!-- the Tigris -->
      <rect x="0" y="560" width="1080" height="140" fill="url(#river)"/>
      <g stroke="#7FC3E3" stroke-linecap="round" opacity=".45">
        <path d="M120 592 H220" stroke-width="4"/><path d="M300 612 H440" stroke-width="3"/>
        <path d="M540 596 H680" stroke-width="4"/><path d="M760 622 H900" stroke-width="3"/>
        <path d="M278 584 H308" stroke-width="5" stroke="#FFC98A"/>
      </g>
    </svg>`;
  };

  /** The Iraqi flag, small: red, white with the takbir in green, black. */
  A.flag = () => `<svg viewBox="0 0 150 100" width="100%" height="100%">
    <rect width="150" height="33.4" fill="#CE1126"/>
    <rect y="33.3" width="150" height="33.4" fill="#FFFFFF"/>
    <rect y="66.6" width="150" height="33.4" fill="#000000"/>
    <text x="75" y="56.5" text-anchor="middle" font-family="Cairo" font-weight="700" font-size="17" fill="#007A3D" direction="rtl">الله أكبر</text>
  </svg>`;
})();
