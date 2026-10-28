import { Link } from 'react-router-dom';
import Star from '../components/star';
import Contact from '../components/contact';

function Intro() {
  return (
    <div className="intro-container">
      <div className="intro-container-inner">
        <div className="intro">
          <h1>
            <Link to="/">Lucy Xu</Link>
          </h1>
          <p>
            <span className="underline">Product designer</span> based in NYC.
          </p>
          <p>
            7 years of <span className="bold">design systems</span> & curating{' '}
            <span className="bold">visual experiences</span>. Currently defining
            visual systems at ServiceNow.
          </p>
          <p>Contact me for more detailed work samples.</p>
        </div>
        <Star />
      </div>
      <Contact />
      <div className="separator">
        <p>↓ Selected works below</p>
      </div>
    </div>
  );
}

export default Intro;
