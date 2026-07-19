import { Link } from 'react-router-dom';
import Citation from './../components/citation';
import notes from './../resources/notes';
import me from './../resources/images/me.jpg';

function More() {
  return (
    <div className="more-container">
      <div className="more-main-container">
        <div className="more-blurb">
          <h2>
            I make things with meticulous attention to detail, on screens and off
          </h2>
          <p>
            Currently I'm building icons, illustrations, and
            animations at ServiceNow on the Visual Experience team. Previously
            I helped build Lightstep 0→1 as 1 of 2 product designers.
          </p>
          <br />
          <p>
            I started my journey with graphic design, photographing and
            photoshopping myself into{' '}
            <Citation number={1} note={notes[1]}>
              absurd scenes
            </Citation>
            , and taught myself to code by building my own Tumblr blog sites.
          </p>
          <br />
          <p>
            My attention to detail, scrappiness, and self starting tendencies
            follow me outside of work. I am a{' '}
            <Citation number={2} note={notes[2]}>
              nail artist
            </Citation>{' '}
            after hours, a hobby that demands the same meticulous pixel-level
            precision I bring to my icon and design system work.
          </p>
          <br />
          <p>
            In my spare time I think I was put on this Earth to{' '}
            <Citation number={3} note={notes[3]}>
              eat
            </Citation>
            . I also like{' '}
            <Citation number={4} note={notes[4]}>
              a good book
            </Citation>{' '}
            and taking{' '}
            <Citation number={5} note={notes[5]}>
              pictures
            </Citation>{' '}
            in my spare time. The best way to contact me for my Goodreads or
            Flickr (or a custom nail set) is via{' '}
            <Link to="mailto:lucylouxu@yahoo.com" className="link">
              email↗
            </Link>
            .
          </p>
        </div>
        <div className="portrait-container">
          <img src={me} alt="me" />
          <p><Citation number={6} note={notes[6]}>Lucy</Citation> Xu</p>
        </div>
      </div>
      <div className="side-quest-container">
        <h4>Some side quests to see</h4>
        <div className="side-quest-list">
          <div className="side-quest-item">
            <Link
              to="https://symbolsoup.lucylouxu.com/"
              target="_blank"
              className="link"
            >
              symbol soup↗
            </Link>
            <p>accessories for memories in the form of digital sprinkles</p>
          </div>
          <div className="side-quest-item">
            <Link
              to="https://archive.lucylouxu.com/"
              target="_blank"
              className="link"
            >
              portfolio archive↗
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default More;
