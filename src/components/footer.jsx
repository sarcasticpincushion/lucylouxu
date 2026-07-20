import { Link } from 'react-router-dom';
import Contact from './../components/contact';

function Footer() {
  return (
    <footer>
      <Contact />
      <p>
        site made by lu, built by{' '}
        <Link to="https://ajzhen.com/" target="_blank" className="link">
          drew↗
        </Link>
      </p>
    </footer>
  );
}

export default Footer;
