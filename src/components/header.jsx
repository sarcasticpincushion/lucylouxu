import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';

function Header({ isWorkPage, introHeadingRef }) {
  const [scrolledPastIntro, setScrolledPastIntro] = useState(false);

  useEffect(() => {
    if (!isWorkPage) return;

    const introHeading = introHeadingRef.current;
    if (!introHeading) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const past = !entry.isIntersecting;
        setScrolledPastIntro(past);
        // hide the intro's own heading so only one "Lucy Xu" shows at a time
        introHeading.style.visibility = past ? 'hidden' : '';
      },
      // account for the sticky header sitting 35px from the top
      { rootMargin: '-70px 0px 0px 0px' }
    );
    observer.observe(introHeading);
    return () => {
      observer.disconnect();
      introHeading.style.visibility = '';
    };
  }, [isWorkPage, introHeadingRef]);

  // On non-work pages there is no intro heading, so always show the title.
  const showTitle = !isWorkPage || scrolledPastIntro;

  return (
    <header>
      <h1 className={showTitle ? 'visible' : ''}>
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
