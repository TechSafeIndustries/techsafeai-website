/**
 * WEB-PHASE-10 S3 — restrained scroll reveal (progressive enhancement).
 * - No-op when the user prefers reduced motion.
 * - Only content still below the viewport at load is staged; nothing visible
 *   is ever hidden, and without JavaScript everything renders normally.
 * - Each element reveals once; nothing re-fires on scroll-back.
 */
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
if (!reduced.matches && 'IntersectionObserver' in window) {
  const groups = document.querySelectorAll<HTMLElement>('.reveal-group');
  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          io.unobserve(entry.target);
          entry.target.classList.add('revealed');
        }
      }
    },
    { rootMargin: '0px 0px -8% 0px' }
  );
  const viewportBottom = window.innerHeight * 0.92;
  groups.forEach((group) => {
    Array.from(group.children).forEach((child, index) => {
      const el = child as HTMLElement;
      if (el.getBoundingClientRect().top <= viewportBottom) return;
      el.style.transitionDelay = `${Math.min(index * 60, 180)}ms`;
      el.classList.add('reveal-pending');
      io.observe(el);
    });
  });
}
