import { Link } from 'react-router-dom';

function Footer() {
  return (
    <footer>
      <ul>
        <li>
          <Link
            to="mailto:lucylouxu@yahoo.com"
            target="_blank"
            className="link"
          >
            Email↗
          </Link>
        </li>
        <li>
          <Link
            href="https://www.linkedin.com/in/lucylouxu/"
            target="_blank"
            className="link"
          >
            Linkedin↗
          </Link>
        </li>
        <li>
          <Link to="/resume.pdf" target="_blank" className="link">
            Resume↗
          </Link>
        </li>
      </ul>
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
