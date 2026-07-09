import { Link } from 'react-router-dom';

function More() {
  return (
    <div className="more-container">
      <div className="more-item">
        <Link
          to="https://symbolsoup.lucylouxu.com/"
          target="_blank"
          className="link"
        >
          symbol soup↗
        </Link>
        <p>accessories for memories in the form of digital sprinkles</p>
      </div>
      <div className="more-item">
        <Link
          to="https://archive.lucylouxu.com/"
          target="_blank"
          className="link"
        >
          portfolio archive↗
        </Link>
      </div>
    </div>
  );
}

export default More;
