import { useEffect } from 'react';

const ExternalRedirect = ({ url }) => {
  useEffect(() => {
    // .replace() removes the current page from session history
    // This prevents the user from getting stuck in a back-button loop
    window.location.replace(url);
  }, [url]);

  return null; // Renders nothing while the redirect happens
};

export default ExternalRedirect;
