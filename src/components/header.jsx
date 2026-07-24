import { Link, useLocation } from 'react-router-dom';

function Header() {
  const { pathname } = useLocation();
  const isWorkPage = pathname === '/' || pathname === '/work';
  const isMorePage = pathname === '/more';
  const isMePage = pathname === '/me';

  return (
    <header>
      {!isWorkPage && (
        <h1>
          <Link to="/">Lucy Xu</Link>
        </h1>
      )}
      <nav>
        <ul>
          <li className={isWorkPage ? 'selected' : ''}>
            <Link to="/">Work</Link>
          </li>
          <li className={isMorePage ? 'selected' : ''}>
            <Link to="/more">More</Link>
          </li>
          <li className={isMePage ? 'selected' : ''}>
            <Link to="/me">Me</Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}

export default Header;
