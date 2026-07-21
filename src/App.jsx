import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Link, Routes, Route } from 'react-router-dom';
import Work from './pages/work';
import More from './pages/more';
import Header from './components/header';
import Footer from './components/footer';
import ExternalRedirect from './utils/redirect';

function App() {
  const location = useLocation();

  // Route changes don't reset scroll by default, so navigating (e.g. Work ->
  // More) inherits the previous page's scroll position. Reset to the top on
  // every path change.
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const host =
    typeof window !== 'undefined' ? window.location.hostname.toLowerCase() : '';
  const isArchiveSubdomain = host.startsWith('archive.');
  // const isArchiveSubdomain = true;
  const isWorkPage = location.pathname === '/' || location.pathname === '/work';

  return (
    <main className="main">
      {isArchiveSubdomain ? (
        <Routes>
          <Route path="/" element={<ExternalRedirect url="/work.html" />} />
          <Route
            path="/about"
            element={<ExternalRedirect url="about.html" />}
          />
        </Routes>
      ) : (
        <>
          <Header isWorkPage={isWorkPage} />
          <Routes>
            <Route path="/" element={<Work />} />
            <Route path="/work" element={<Work />} />
            <Route path="/more" element={<More />} />
          </Routes>
          <Footer />
        </>
      )}
    </main>
  );
}

export default App;
