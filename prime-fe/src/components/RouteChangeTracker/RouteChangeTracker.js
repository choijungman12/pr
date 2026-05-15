import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { getAnalytics, logEvent } from "firebase/analytics";

function RouteChangeTracker() {
  const location = useLocation();
  const analytics = getAnalytics();

  useEffect(() => {
    logEvent(analytics, "page_view", {
      page_path: location.pathname,
      page_location: window.location.href,
      page_title: document.title,
    });
  }, [location, analytics]);

  return null;
}

export default RouteChangeTracker;
