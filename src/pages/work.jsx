import { Link } from 'react-router-dom';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import Intro from './../components/intro';
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

const videoAssets = new Set([
  '1A',
  '1B',
  '1C',
  '2A',
  '2B',
  '3A',
  '3B',
  '4A',
  '4B',
]);

const getSelectionValue = (projectId, itemId) => {
  return `${projectId}${String.fromCharCode(65 + itemId)}`;
};

// Sticky-scroll gallery tuning.
const NAV_GAP = 24; // extra clearance below the sticky nav where a project pins
const SCROLL_RATIO = 1; // vertical scroll px per horizontal travel px (>1 = longer, slower runway)
// Optional "buttery" smoothing: wrap scrollYProgress in useSpring(…, SPRING) in
// GalleryProject for a lagged feel. Left off by default for a tight 1:1 track.
// const SPRING = { stiffness: 300, damping: 40, restDelta: 0.001 };

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
    <p className="project-thumbnail-title">
      {item.text}
      {item.linkText && (
        <Link to={item.linkUrl} className="link">
          {item.linkText}
        </Link>
      )}
      {item.suffix}
    </p>
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

// One project of the sticky-scroll gallery.
//
// The section is TALL; inside it a viewport (.gallery-pin) is `position: sticky`
// and pins below the nav. Motion's useScroll reports how far the page has
// scrolled through this section (0 at its top, 1 at its bottom); useTransform
// maps that progress to horizontal travel of the thumbnail track while the
// project's details stay pinned on the left. The section's height is sized so
// the pinned scroll distance equals the track's horizontal travel (×
// SCROLL_RATIO) — this keeps scroll speed consistent across projects with
// different thumbnail counts. When the strip finishes, the section unpins and
// normal vertical scrolling continues to the next project; scrolling up
// reverses it. Because the horizontal position is derived from real scroll,
// wheel / trackpad / keyboard all drive it natively — no input interception.
function GalleryProject({ project, projectId, navClear }) {
  const sectionRef = useRef(null);
  const trackRef = useRef(null);
  const [travel, setTravel] = useState(0);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end end'],
  });
  const x = useTransform(scrollYProgress, [0, 1], [0, -travel]);

  // Measure how far the track can travel (content width beyond the viewport).
  // Widths shift as media/layout settle, so re-measure on resize + media load.
  useLayoutEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const measure = () =>
      setTravel(Math.max(0, track.scrollWidth - track.clientWidth));
    measure();

    const resizeObserver = new ResizeObserver(measure);
    resizeObserver.observe(track);

    const media = track.querySelectorAll('video, img');
    media.forEach((el) => {
      el.addEventListener('loadeddata', measure);
      el.addEventListener('load', measure);
    });

    return () => {
      resizeObserver.disconnect();
      media.forEach((el) => {
        el.removeEventListener('loadeddata', measure);
        el.removeEventListener('load', measure);
      });
    };
  }, []);

  // Runway = one pin-height (100vh minus nav clearance) plus the horizontal
  // travel scaled by SCROLL_RATIO. With travel 0 it collapses to a single
  // pin-height and the project simply renders statically (nothing to scroll).
  const minHeight = `calc(100vh - ${navClear}px + ${travel * SCROLL_RATIO}px)`;

  return (
    <section className="gallery-project" ref={sectionRef} style={{ minHeight }}>
      <div className="gallery-pin">
        <div className="gallery-stage">
          <div className="gallery-details-layer">
            <ProjectDetails project={project} />
          </div>
          <motion.div className="gallery-track" ref={trackRef} style={{ x }}>
            <Thumbnails project={project} projectId={projectId} />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// Sticky horizontal gallery controller — the work page's only layout.
// Owns the nav clearance so every project pins at the same line below the nav.
function FrozenGallery() {
  // Exposed to CSS as --nav-clear (drives .gallery-pin's top/height) and reused
  // in each section's min-height runway calc.
  const [navClear, setNavClear] = useState(NAV_GAP);

  useEffect(() => {
    const measure = () => {
      const header = document.querySelector('.main > header');
      const clear = header
        ? (parseFloat(getComputedStyle(header).top) || 0) +
          header.offsetHeight +
          NAV_GAP
        : NAV_GAP;
      setNavClear(clear);
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  return (
    <div className="gallery" style={{ '--nav-clear': `${navClear}px` }}>
      {projects.map((project, projectId) => (
        <GalleryProject
          key={projectId}
          project={project}
          projectId={projectId}
          navClear={navClear}
        />
      ))}
    </div>
  );
}

function Work() {
  return (
    <div className="work-container">
      <Intro />
      <FrozenGallery />
    </div>
  );
}

export default Work;
