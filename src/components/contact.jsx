import { Link } from 'react-router-dom';

function Contact() {
  return (
    <ul>
      <li>
        <Link
          to="mailto:lucylouxu@yahoo.com"
          target="_blank"
          className="link underline"
        >
          Email↗
        </Link>
      </li>
      <li>
        <Link
          to="https://www.linkedin.com/in/lucylouxu/"
          target="_blank"
          className="link underline"
        >
          Linkedin↗
        </Link>
      </li>
      <li>
        <Link
          to="https://drive.google.com/file/d/11EYaBIWngERkrVrGw32CgfNKb3hxifS5/view"
          target="_blank"
          className="link underline"
        >
          Resume↗
        </Link>
      </li>
    </ul>
  );
}

export default Contact;
