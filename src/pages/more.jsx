import { Link } from 'react-router-dom';

function More() {
  return (
    <div className="more-container">
      <div className="more-blurb">
        <h2>
          I make things with meticulous attention to detail, on screens and off
        </h2>
        <p>
          Currently I'm building icons, illustrations, and animations at
          ServiceNow on the Visual Experience team. Previously I helped build
          Lightstep 0→1 as 1 of 2 product designers.
        </p>
        <br />
        <p>
          I started my journey with photographing and photoshopping myself into
          absurd scenes, and taught myself to code by building my own Tumblr
          blog sites.
        </p>
        <br />
        <p>
          My attention to detail, scrappiness, and self starting tendencies
          follow me outside of work. I am a nail artist↗ after hours, a hobby
          that demands the same meticulous pixel-level precision I bring to my
          icon and design system work.
        </p>
        <br />
        <p>
          I also enjoy eating, reading, and taking pictures in my spare time.
          The best way to contact me for my Goodreads or Flickr (or a custom
          nail set) is via email↗.
        </p>
      </div>
      <div className="side-quest-container">
        <h4>More side quests to see</h4>
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
