import { useEffect } from "react";
import { useDispatch } from "react-redux";
import {
  setCurrentLocation,
  DEFAULT_LOCATION,
  setMapCenter,
} from "../redux/mapState";

function useGeolocation() {
  const dispatch = useDispatch();

  useEffect(() => {
    if (!navigator.geolocation) {
      dispatch(setCurrentLocation(DEFAULT_LOCATION));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const currentLoc = { lat: latitude, lng: longitude };
        dispatch(setCurrentLocation(currentLoc));
        dispatch(setMapCenter(currentLoc));
      },
      (error) => {
        dispatch(setCurrentLocation(DEFAULT_LOCATION));
        dispatch(setMapCenter(DEFAULT_LOCATION));
      }
    );
  }, [dispatch]);

  return;
}

export default useGeolocation;
