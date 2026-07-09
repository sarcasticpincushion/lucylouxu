import { Link } from 'react-router-dom';

function Header({ isWorkPage }) {
  return (
    <header>
      <h1>
        <Link to="/">Lucy Xu</Link>
      </h1>
      <nav>
        <ul>
          <li className={isWorkPage ? 'selected' : ''}>
            <Link to="/">Work</Link>
          </li>
          <li className={!isWorkPage ? 'selected' : ''}>
            <Link to="/more">More</Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}

export default Header;
