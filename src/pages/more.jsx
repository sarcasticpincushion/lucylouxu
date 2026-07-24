import { Link } from 'react-router-dom';

function More() {
  return (
    <div className="more-container">
      <h2>A playground for my side quests to be looked through</h2>
      <div className="more-container-list">
        <div className="more-container-list-item">
          <h4>color combo cloner</h4>
          <p>
            I wanted to optimize my design specification process (I was
            detailing variations of custom calendar cards) so I vibe-coded a
            plugin that hooks into your library color variables to generate
            multiple color variants.
          </p>
          <video
            src={`/animations/colorcombocloner.mp4`}
            width="100%"
            autoPlay
            loop
            muted
            playsInline
          />
        </div>
        <div className="more-container-list-item">
          <Link
            to="https://symbolsoup.lucylouxu.com/"
            target="_blank"
            className="link"
          >
            symbol soup↗
          </Link>
          <p>
            I vibe-coded a web app: add accessories to your memories in the form
            of digital sprinkles
          </p>
          <video
            src={`/animations/symbolsoup.mp4`}
            width="100%"
            autoPlay
            loop
            muted
            playsInline
          />
        </div>
      </div>
    </div>
  );
}

export default More;
