import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useRef, useState } from "react";
import {
  MapContainer,
  Marker,
  Polyline,
  Popup,
  TileLayer,
} from "react-leaflet";

// Fix for default marker icon in Leaflet
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import markerIcon from "/mammal.png";

const getCoordinates = (arr) =>
  arr[0].split(",").map((num: any) => parseFloat(num.trim()));

const customMarker = new L.Icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [40, 41],
  iconAnchor: [20, 10],
});

const pathData: [number, number][] = [
  [8.4667, -83.5917], // La Leona Ranger Station
  [8.47, -83.593], // Intermediate Point 1
  [8.473, -83.5945], // Intermediate Point 2
  [8.476, -83.596], // Intermediate Point 3
  [8.479, -83.5975], // Intermediate Point 4
  [8.4811, -83.5986], // Sirena Ranger Station
];

const lerp = (start: number, end: number, t: number) =>
  start + (end - start) * t;

const LeafletTracking = () => {
  const [currentPath, setCurrentPath] = useState([pathData[0]]);
  const [markerPosition, setMarkerPosition] = useState(pathData[0]);
  const markerIndex = useRef(0);

  const animationFrame = useRef<number | null>(null);

  // useEffect(() => {
  //   const animateMarker = () => {
  //     if (markerIndex.current < pathData.length - 1) {
  //       const start = pathData[markerIndex.current];
  //       const end = pathData[markerIndex.current + 1];

  //       let t = 0; // Progress (0 to 1)
  //       const animationStep = () => {
  //         if (t < 1) {
  //           t += 0.01; // Controls speed (Lower = smoother, Higher = faster)

  //           const newLat = lerp(start[0], end[0], t);
  //           const newLng = lerp(start[1], end[1], t);
  //           setMarkerPosition([newLat, newLng]);

  //           // Gradually add new points to the polyline for smooth effect
  //           setCurrentPath((prevPath) => [...prevPath, [newLat, newLng]]);

  //           animationFrame.current = requestAnimationFrame(animationStep);
  //         } else {
  //           // Move to next waypoint
  //           markerIndex.current += 1;
  //           animateMarker();
  //         }
  //       };

  //       animationFrame.current = requestAnimationFrame(animationStep);
  //     } else {
  //       // Reset path after reaching the last point
  //       setTimeout(() => {
  //         markerIndex.current = 0; // Reset index
  //         setMarkerPosition(pathData[0]); // Move marker back to start
  //         setCurrentPath([pathData[0]]); // Reset polyline with starting position
  //         animateMarker(); // Restart animation
  //       }, 2000); // Delay before restarting
  //     }
  //   };

  //   animateMarker(); // Start animation

  //   return () => {
  //     if (animationFrame.current) cancelAnimationFrame(animationFrame.current);
  //   };
  // }, []);
  const [data, setData] = useState<{ [key: string]: any }[]>([]);
  const API_URL = import.meta.env.VITE_NETLIFY_FUNCTION_URL;
  const API_KEY = import.meta.env.VITE_SECRET_API_KEY;

  useEffect(() => {
    async function fetchData() {
      const response = await fetch(API_URL, {
        method: "GET",
        headers: {
          "x-api-key": API_KEY,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      const filteredData = data
        .filter((item: { Status: string }) => item.Status === "Active")
        .map((item: { [key: string]: any }) => ({
          gpsLocation: getCoordinates(item["GPS Location (from Site)"]),
          location: item["🔗 Location (for Webflow)"],
          specie: item["🔗 Specie detected (for Webflow)"],
          sponsoredBy: item["🔗 Sponsored by (for Webflow)"],
          id: item["Item ID"],
        }));

      setData(filteredData);
    }

    fetchData();
  }, [API_URL, API_KEY]);

  if (!data.length) return null;

  return (
    <MapContainer
      center={data[0].gpsLocation}
      zoom={14}
      style={{ height: "800px", width: "800px" }}
    >
      {/* OpenStreetMap Tile Layer */}
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        opacity={0.7}
        zIndex={10}
      />

      {/* Expanding Polyline (tracking movement) */}
      {/* <Polyline positions={currentPath} color="red" weight={3} /> */}

      {/* Moving Jaguar Marker */}
      {data.map((item) => (
        <Marker position={item.gpsLocation} icon={customMarker} key={item.id}>
          <Popup>
            <div>
              <h2>{item.specie}</h2>
              <p>
                <strong>Location:</strong> {item.location}
              </p>
              <p>
                <strong>Sponsored by:</strong> {item.sponsoredBy}
              </p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default LeafletTracking;
