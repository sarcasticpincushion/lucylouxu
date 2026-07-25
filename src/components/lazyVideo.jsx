import { useEffect, useRef } from 'react';

// A video that only downloads and decodes while it's on (or near) screen.
// Off-screen videos are paused AND unloaded so the browser releases their
// decoded frame buffers.
//
// Why this matters: every iOS browser is WebKit (Apple requires it), so Chrome
// and Brave inherit Safari's hard limit on simultaneous video decoding and its
// per-tab memory watchdog. Mounting ~10 autoplaying videos at once (as the Work
// page did) blows past that budget and the watchdog kills the tab. Capping
// concurrent decoding to just what's visible keeps memory flat. Same
// IntersectionObserver approach the star uses to pause itself off-screen.
export default function LazyVideo({ src, poster, className, width }) {
  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // iOS only allows inline autoplay for muted videos; set the property
    // directly since the attribute alone isn't always honored.
    video.muted = true;

    const load = () => {
      if (video.getAttribute('src') === src) return;
      video.src = src;
      // iOS rejects the play() promise when a load interrupts it; ignore it.
      video.play().catch(() => {});
    };

    const unload = () => {
      if (!video.hasAttribute('src')) return;
      video.pause();
      video.removeAttribute('src');
      video.load(); // frees decoded buffers; the poster shows again
    };

    // No IntersectionObserver (very old browsers): just play it and move on.
    if (typeof IntersectionObserver !== 'function') {
      load();
      return;
    }

    // rootMargin gives a head start so a video is usually loaded just before it
    // scrolls into view, avoiding a blank flash.
    const observer = new IntersectionObserver(
      ([entry]) => (entry.isIntersecting ? load() : unload()),
      { rootMargin: '300px 0px', threshold: 0 }
    );
    observer.observe(video);

    return () => {
      observer.disconnect();
      unload();
    };
  }, [src]);

  return (
    <video
      ref={videoRef}
      className={className}
      width={width}
      poster={poster}
      muted
      loop
      playsInline
      preload="none"
    />
  );
}
