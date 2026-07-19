import { Link } from 'react-router-dom';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import Intro from './../components/intro';
import Footer from './../components/footer';
import projects from './../resources/projects.json';
import image1 from './../resources/images/1.svg';
import image2 from './../resources/images/2.svg';
import image3 from './../resources/images/3.svg';
import image4 from './../resources/images/4.svg';

const imageMap = {
  image1,
  image2,
  image3,
  image4,
};

const videoAssets = new Set(['1A', '1B', '1C', '2A', '2B', '3A', '3B', '4A', '4B']);

const getSelectionValue = (projectId, itemId) => {
  return `${projectId}${String.fromCharCode(65 + itemId)}`;
};

const DESKTOP_QUERY = '(min-width: 993px)'; // $lg (992px) + 1
const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';
const SPEED = 1; // vertical-scroll : horizontal-travel ratio (raise to shorten)

const clamp = (value, lo, hi) => Math.max(lo, Math.min(hi, value));

function computeEnabled() {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return (
    window.matchMedia(DESKTOP_QUERY).matches &&
    !window.matchMedia(REDUCED_MOTION_QUERY).matches
  );
}

function ThumbnailMedia({ project, projectId, itemId }) {
  const assetKey = getSelectionValue(projectId + 1, itemId);
  const hasVideo = videoAssets.has(assetKey);
  return (
    <div className="project-thumbnail-media">
      {hasVideo ? (
        <video
          src={`/animations/${assetKey}.mp4`}
          width="100%"
          autoPlay
          loop
          muted
          playsInline
        />
      ) : (
        <img src={imageMap[project.image]} width="100%" />
      )}
    </div>
  );
}

function ThumbnailTitle({ item }) {
  return (
    <div className="project-thumbnail-title">
      {item.text}
      {item.linkText && (
        <Link to={item.linkUrl} className="link">
          {item.linkText}
        </Link>
      )}
      {item.suffix}
    </div>
  );
}

function ProjectDetails({ project, innerRef }) {
  return (
    <div className="project-item-details" ref={innerRef}>
      <div className="project-item-header">
        <h2>{project.title}</h2>
      </div>
      <div className="project-item-body">
        <h3 className="project-type">{project.type}</h3>
        {project.description.map((para, i) => (
          <div key={i}>
            <p>{para}</p>
            <br />
          </div>
        ))}
        {project.links?.map((link, id) => (
          <Link key={id} to={link.url} target="_blank" className="link">
            {link.text}
          </Link>
        ))}
      </div>
    </div>
  );
}

function Thumbnails({ project, projectId }) {
  return project.items.map((item, itemId) => (
    <div key={itemId} className="project-thumbnail">
      <ThumbnailMedia project={project} projectId={projectId} itemId={itemId} />
      <ThumbnailTitle item={item} />
    </div>
  ));
}

// Fallback: the original stacked layout with per-project native horizontal
// scroll. Used on narrow viewports and when the user prefers reduced motion.
function StackedGallery() {
  return (
    <div className="project-container">
      {projects.map((project, projectId) => (
        <div key={projectId} className="project-item">
          <ProjectDetails project={project} />
          <div className="project-thumbnails">
            <ul className="project-thumbnails-track">
              {project.items.map((item, itemId) => (
                <li key={itemId} className="project-thumbnail">
                  <ThumbnailMedia
                    project={project}
                    projectId={projectId}
                    itemId={itemId}
                  />
                  <ThumbnailTitle item={item} />
                </li>
              ))}
            </ul>
          </div>
        </div>
      ))}
    </div>
  );
}

// One project, pinned to the viewport while vertical scroll drives its
// thumbnails horizontally. When its last thumbnail is reached the section
// unpins and normal vertical scrolling continues to the next project, which
// then pins and scrolls its own thumbnails — an alternating motion.
function PinnedProject({ project, projectId }) {
  const wrapperRef = useRef(null);
  const viewportRef = useRef(null);
  const trackRef = useRef(null);
  const detailsRef = useRef(null);
  const metrics = useRef({
    stickyTop: 0,
    viewportH: 0,
    horizontalTravel: 0,
    wrapperH: 0,
  });
  const ticking = useRef(false);
  const rafId = useRef(0);

  useLayoutEffect(() => {
    const wrapper = wrapperRef.current;
    const viewport = viewportRef.current;
    const track = trackRef.current;
    if (!wrapper || !viewport || !track) return;

    const update = () => {
      const { stickyTop, viewportH, horizontalTravel, wrapperH } =
        metrics.current;
      const denom = wrapperH - viewportH;
      const rectTop = wrapper.getBoundingClientRect().top;

      if (denom <= 0 || horizontalTravel <= 0) {
        track.style.transform = 'translate3d(0,0,0)';
        return;
      }
      const progress = clamp((stickyTop - rectTop) / denom, 0, 1);
      track.style.transform = `translate3d(${-(progress * horizontalTravel)}px,0,0)`;
    };

    const measure = () => {
      // Height follows the content — the taller of the details card and the
      // thumbnails — so the pinned viewport keeps the original row height
      // rather than filling the screen.
      viewport.style.height = 'auto';
      const detailsH = detailsRef.current
        ? detailsRef.current.getBoundingClientRect().height
        : 0;
      const trackH = track.getBoundingClientRect().height;
      const viewportH = Math.max(detailsH, trackH);
      viewport.style.height = `${viewportH}px`;

      // Pin the project centered vertically in the screen.
      const stickyTop = Math.max(0, (window.innerHeight - viewportH) / 2);
      viewport.style.top = `${stickyTop}px`;

      const horizontalTravel = Math.max(
        0,
        track.scrollWidth - viewport.clientWidth
      );
      const wrapperH = viewportH + horizontalTravel / SPEED;
      wrapper.style.height = `${wrapperH}px`;

      metrics.current = { stickyTop, viewportH, horizontalTravel, wrapperH };
      update();
    };

    const onScroll = () => {
      if (ticking.current) return;
      ticking.current = true;
      rafId.current = requestAnimationFrame(() => {
        ticking.current = false;
        update();
      });
    };

    measure();

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', measure);

    // Track width shifts as media/layout settle; observe it (not the viewport,
    // whose height we mutate in measure — that would loop).
    const resizeObserver = new ResizeObserver(measure);
    resizeObserver.observe(track);

    const media = track.querySelectorAll('video, img');
    media.forEach((el) => {
      el.addEventListener('loadeddata', measure);
      el.addEventListener('load', measure);
    });

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', measure);
      resizeObserver.disconnect();
      media.forEach((el) => {
        el.removeEventListener('loadeddata', measure);
        el.removeEventListener('load', measure);
      });
      cancelAnimationFrame(rafId.current);
    };
  }, []);

  return (
    <div className="gallery-project" ref={wrapperRef}>
      <div className="gallery-viewport" ref={viewportRef}>
        <div className="gallery-details-layer">
          <ProjectDetails project={project} innerRef={detailsRef} />
        </div>
        <div className="gallery-track" ref={trackRef}>
          <Thumbnails project={project} projectId={projectId} />
        </div>
      </div>
    </div>
  );
}

function PinnedGallery() {
  return (
    <div className="gallery-list">
      {projects.map((project, projectId) => (
        <PinnedProject
          key={projectId}
          project={project}
          projectId={projectId}
        />
      ))}
    </div>
  );
}

function Work({ introHeadingRef }) {
  const [enabled, setEnabled] = useState(computeEnabled);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const desktop = window.matchMedia(DESKTOP_QUERY);
    const reduced = window.matchMedia(REDUCED_MOTION_QUERY);
    const sync = () => setEnabled(computeEnabled());
    desktop.addEventListener('change', sync);
    reduced.addEventListener('change', sync);
    return () => {
      desktop.removeEventListener('change', sync);
      reduced.removeEventListener('change', sync);
    };
  }, []);

  return (
    <div className={`work-container${enabled ? ' work-container--pinned' : ''}`}>
      <Intro introHeadingRef={introHeadingRef} />
      {enabled ? (
        <PinnedGallery />
      ) : (
        <>
          <StackedGallery />
          <Footer />
        </>
      )}
    </div>
  );
}

export default Work;
