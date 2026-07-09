import { Link } from 'react-router-dom';
import { useState } from 'react';
import Intro from './../components/intro';
import projects from './../resources/projects.json';
import image1 from './../resources/images/1.svg';
import image2 from './../resources/images/2.svg';
import image3 from './../resources/images/3.svg';

const imageMap = {
  image1,
  image2,
  image3,
};

function Work() {
  const [selectedItems, setSelectedItems] = useState(() => {
    return projects.reduce((acc, _, projectId) => {
      acc[projectId] = 0;
      return acc;
    }, {});
  });

  const handleSelectItem = (projectId, itemId) => {
    setSelectedItems({
      ...selectedItems,
      [projectId]: itemId,
    });
  };

  return (
    <div className="work-container">
      <Intro />

      <div className="project-container">
        {projects.map((project, projectId) => (
          <div key={projectId} className="project-item">
            <div className="project-item-details">
              <div className="project-item-header">
                <h2>{project.title}</h2>
                {project.status && (
                  <p className="project-status">{project.status}</p>
                )}
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
            <div className="project-item-thumbnail">
              {/* <video controls>
                <source
                  src='/src/resources/images/placeholder.mov'
                  type='video/quicktime'
                />
                Your browser does not support the video tag.
              </video> */}
              <img src={imageMap[project.image]} width="100%" />
              <div className="project-item-thumbnail-details">
                <div>
                  <h4>notable projects</h4>
                  <ul>
                    {project.items.map((item, itemId) => (
                      <li
                        key={itemId}
                        className={
                          selectedItems[projectId] === itemId ? 'active' : ''
                        }
                        onClick={() => handleSelectItem(projectId, itemId)}
                      >
                        {item.text}
                        {item.linkText && (
                          <Link
                            to={item.linkUrl}
                            onClick={(e) => e.stopPropagation()}
                            className="link"
                          >
                            {item.linkText}
                          </Link>
                        )}
                        {item.suffix}
                      </li>
                    ))}
                  </ul>
                </div>
                {project.items.some(
                  (item) =>
                    item.text?.includes('*') || item.suffix?.includes('*')
                ) && <aside>*contact for more details</aside>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Work;
