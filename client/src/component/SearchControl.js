import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import { GeoSearchControl, OpenStreetMapProvider } from 'leaflet-geosearch';

const SearchControl = ({ setAddress, setPosition }) => {
  const map = useMap();

  useEffect(() => {
    const provider = new OpenStreetMapProvider();

    const searchControl = new GeoSearchControl({
      provider,
      style: 'bar',
      autoClose: true,
      showMarker: true,
      showPopup: false,
      retainZoomLevel: false,
      animateZoom: true,
      keepResult: false,
      searchLabel: 'Enter address',
    });

    map.addControl(searchControl);

    map.on('geosearch/showlocation', (result) => {
      const { x: lng, y: lat, label } = result.location;
      setPosition({ lat, lng });
      setAddress(label);
    });

    return () => map.removeControl(searchControl);
  }, [map, setAddress, setPosition]);

  return null;
};

export default SearchControl;
