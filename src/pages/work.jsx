import { Link } from 'react-router-dom';
import { useState } from 'react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
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

const getSelectionValue = (projectId, itemId) => {
  return `${projectId}${String.fromCharCode(65 + itemId)}`;
};

function Work() {
  const [selectedItems, setSelectedItems] = useState(() => {
    return projects.reduce((acc, _, projectId) => {
      const projectNumber = projectId + 1;
      acc[projectNumber] = getSelectionValue(projectNumber, 0);
      return acc;
    }, {});
  });

  const handleSelectItem = (projectId, itemId) => {
    setSelectedItems((prevSelectedItems) => ({
      ...prevSelectedItems,
      [projectId]: getSelectionValue(projectId, itemId),
    }));
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
              {/* <div>{selectedItems[projectId + 1]}</div> */}

              {['1A', '1B'].includes(selectedItems[projectId + 1]) ? (
                <DotLottieReact
                  src={`/animations/${selectedItems[projectId + 1]}.lottie`}
                  loop
                  autoplay
                  layout={{
                    fit: 'contain',
                    align: [0.5, 0],
                  }}
                />
              ) : (
                <img src={imageMap[project.image]} width="100%" />
              )}
              <div className="project-item-thumbnail-details">
                <ul>
                  {project.items.map((item, itemId) => (
                    <li
                      key={itemId}
                      className={
                        selectedItems[projectId + 1] ===
                        getSelectionValue(projectId + 1, itemId)
                          ? 'active'
                          : ''
                      }
                      onClick={() => handleSelectItem(projectId + 1, itemId)}
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
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Work;
