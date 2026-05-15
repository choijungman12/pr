const usePolygon = () => {
  const sendPoint = async (lat, lng) => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/polygon/point?lat=${lat}&lng=${lng}`,
        {
          method: "GET",
        }
      );
      if (response.ok) {
        const result = await response.json();
        return result.data;
      } else {
        return response.statusText;
      }
    } catch (error) {
      return error;
    }
  };

  const sendBounds = async (neLat, neLng, swLat, swLng) => {
    try {

      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/polygon/bounds?neLat=${neLat}&neLng=${neLng}&swLat=${swLat}&swLng=${swLng}`,
        {
          method: "GET",
        }
      );

      if (response.ok) {
        const result = await response.json();
        return result;
      } else {
        return response.statusText;
      }
    } catch (error) {
      return error;
    }
  };

  return { sendPoint, sendBounds };
};
export default usePolygon;
