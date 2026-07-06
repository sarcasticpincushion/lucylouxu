import Intro from './../components/intro';
import projects from './../resources/projects.json';
import { useState } from 'react';

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
                  <>
                    <p key={i}>{para}</p>
                    <br />
                  </>
                ))}
                {project.links?.map((link, id) => (
                  <a
                    key={id}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="link"
                  >
                    {link.text}
                  </a>
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
              <img src={project.image} width="100%" />
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
                          <a
                            href={item.linkUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="link"
                          >
                            {item.linkText}
                          </a>
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
