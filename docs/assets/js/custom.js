// assets/js/custom.js
document.addEventListener("DOMContentLoaded", function() {
    document.querySelectorAll('video.hover-play').forEach(function(video) {
      video.addEventListener('mouseenter', function() {
        video.play();
      });
      video.addEventListener('mouseleave', function() {
        video.pause();
        video.currentTime = 0;
      });
    });
  });
  