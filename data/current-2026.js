(() => {
  const files = [
    'data/current-2026-clean-part1.js',
    'data/current-2026-clean-part2.js',
    'data/current-2026-clean-part3.js',
    'data/current-2026-clean-part4.js',
    'data/current-2026-clean-part5.js',
    'data/current-2026-clean-part6.js',
    'data/current-2026-clean-part7.js',
    'data/current-2026-clean-part8.js',
    'data/current-2026-finalize.js'
  ];
  document.write(files.map(src => `<script src="${src}"><\/script>`).join(''));
})();