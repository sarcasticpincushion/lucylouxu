import { useLocation } from 'react-router-dom';
import { Link, Routes, Route } from 'react-router-dom';
import Work from './pages/work';
import More from './pages/more';
import Header from './components/header';
import Footer from './components/footer';

function App() {
  const location = useLocation();
  const isWorkPage = location.pathname === '/' || location.pathname === '/work';

  return (
    <main className="main">
      <Header isWorkPage={isWorkPage} />

      <Routes>
        <Route path="/" element={<Work />} />
        <Route path="/work" element={<Work />} />
        <Route path="/more" element={<More />} />
      </Routes>

      <Footer />
    </main>
  );
}

export default App;
