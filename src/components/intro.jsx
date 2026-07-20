import { Link } from 'react-router-dom';
import Star from './../components/star';
import Contact from './../components/contact';

function Intro() {
  return (
    <div className="intro-container">
      <div className="intro-container-inner">
        <div className="intro">
          <h1>
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
            Contact me for detailed work samples.
          </p>
        </div>
        <Star />
      </div>
      <Contact />
      <div className="separator">
        <p>↓ Selected works samples below</p>
      </div>
    </div>
  );
}

export default Intro;
