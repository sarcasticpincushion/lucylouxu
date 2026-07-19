import { Link } from 'react-router-dom';
import me from './../resources/images/me.png';
import Star from './../components/star';

function Intro({ introHeadingRef }) {
  return (
    <div className="intro-container">
      <div className="intro-container-inner">
        <div className="intro">
          <h1 ref={introHeadingRef}>
            <Link to="/">Lucy Xu</Link>
          </h1>
          <p>
            <span className="underline">Product designer</span> with a visual
            design background, based in NYC.
          </p>
          <p>
            6 years of design systems & curating visual experiences. Currently
            making/animating icons and illustrations at ServiceNow.
          </p>
          <p>
            Contact me for more detailed work samples.
          </p>
          {/* <p>
            I enjoy eating, reading, and taking pictures in my spare time. Best
            way to contact me for my Goodreads or Flickr is via{' '}
            <Link
              to="mailto:lucylouxu@yahoo.com"
              target="_blank"
              className="link"
            >
              email↗
            </Link>
            .
          </p>
          <div className="link-group">
            <Link
              to="https://www.linkedin.com/in/lucylouxu/"
              target="_blank"
              className="link"
            >
              Linkedin↗
            </Link>
            <Link to="" target="_blank" className="link">
              Resume↗
            </Link>
          </div>
          <img src={me} alt="me" /> */}
        </div>
        <Star />
      </div>
      <div className="separator">
        <p>↓ Selected works below</p>
      </div>
    </div>
  );
}

export default Intro;
