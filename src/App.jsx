import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Routes, Route } from 'react-router-dom';
import Work from './pages/work';
import More from './pages/more';
import Me from './pages/me';
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

  return (
    <main className="main">
      <Header />
      <Routes>
        <Route path="/" element={<Work />} />
        <Route path="/work" element={<Work />} />
        <Route path="/more" element={<More />} />
        <Route path="/me" element={<Me />} />
      </Routes>
      <Footer />
    </main>
  );
}

export default App;
