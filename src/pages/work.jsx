import { Link } from 'react-router-dom';
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

function ProjectDetails({ project }) {
  return (
    <div className="project-item-details">
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

// Clicking a thumbnail slides it to the front of its strip. inline: 'start'
// aligns it to the container's start (honoring scroll-padding-left, so it
// clears the details column); block: 'nearest' keeps the page from scrolling
// vertically. Snap points make the landing crisp.
const scrollThumbnailIntoView = (event) => {
  event.currentTarget.scrollIntoView({
    behavior: 'smooth',
    inline: 'start',
    block: 'nearest',
  });
};

// Stacked gallery: each project sits in its own row with a details card and a
// horizontal strip of thumbnails you scroll/swipe through yourself. No
// scroll-driven motion — the page just scrolls vertically project to project.
function Gallery() {
  return (
    <div className="project-container">
      {projects.map((project, projectId) => (
        <div key={projectId} className="project-item">
          <ProjectDetails project={project} />
          <div className="project-thumbnails">
            <ul className="project-thumbnails-track">
              {project.items.map((item, itemId) => (
                <li
                  key={itemId}
                  className="project-thumbnail"
                  onClick={scrollThumbnailIntoView}
                >
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

function Work() {
  return (
    <div className="work-container">
      <Intro />
      <Gallery />
    </div>
  );
}

export default Work;
