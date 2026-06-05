gsap.from(".hero-text-block > *", {
  y: 30,
  opacity: 0,
  duration: 0.8,
  stagger: 0.2,
  ease: "power2.out"
});
function animarModal() {

  gsap.from(".modal-card", {
    opacity: 0,
    y: 40,
    duration: 0.4,
    ease: "power2.out"
  });

  gsap.from(
    ".modal-title, .modal-section, .modal-ingredientes li, .modal-preparo",
    {
      opacity: 0,
      y: 20,
      duration: 0.6,
      stagger: 0.1,
      ease: "power2.out",
      delay: 0.2
    }
  );
}