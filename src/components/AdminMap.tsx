// // src/components/AdminMap.tsx
// import React, { useEffect, useRef, useState, type JSX } from "react";
// import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
// import { DivIcon } from "leaflet";
// import { io } from "socket.io-client";

// type RiderLocation = {
//   riderId: string;
//   lat: number;
//   lng: number;
//   updatedAt?: string;
// };

// const BACKEND_URL = import.meta.env.VITE_BACKEND_URL ?? "http://localhost:5000";
// const socket = io(BACKEND_URL, { autoConnect: true });

// // BIG emoji icon 🛵
// const riderIcon = new DivIcon({
//   html: `<div style="font-size:48px;">🛵</div>`,
//   className: "emoji-marker",
//   iconSize: [48, 48],
//   iconAnchor: [24, 24],
// });

// // Helper to recenter the map
// function Recenter({ lat, lng }: { lat: number; lng: number }) {
//   const map = useMap();
//   useEffect(() => {
//     map.setView([lat, lng]);
//   }, [lat, lng, map]);
//   return null;
// }

// export default function AdminMap(): JSX.Element {
//   const [rider, setRider] = useState<RiderLocation | null>(null);
//   const targetRef = useRef<{ lat: number; lng: number } | null>(null);

//   useEffect(() => {
//     fetch(`${BACKEND_URL}/riders`)
//       .then((r) => r.json())
//       .then((data: RiderLocation[]) => {
//         if (data.length > 0) setRider(data[0]);
//       });

//     socket.on("riderLocationUpdate", (loc: RiderLocation) => {
//       if (loc.riderId === "RIDER1") {
//         targetRef.current = { lat: loc.lat, lng: loc.lng };
//         setRider((prev) =>
//           prev ? { ...prev, updatedAt: loc.updatedAt } : loc
//         );
//       }
//     });

//     return () => {
//       socket.off("riderLocationUpdate");
//     };
//   }, []);

//   // --- Simulate updates every 3s ---
//   useEffect(() => {
//     const interval = setInterval(() => {
//       const lat = 12.97 + Math.random() * 0.01;
//       const lng = 77.59 + Math.random() * 0.01;

//       fetch(`${BACKEND_URL}/update-location`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ riderId: "RIDER1", lat, lng }),
//       });
//     }, 3000);

//     return () => clearInterval(interval);
//   }, []);

//   // --- Smooth animation ---
//   useEffect(() => {
//     let animationFrame: number;

//     const animate = () => {
//       if (rider && targetRef.current) {
//         const speed = 0.05; // smaller = slower
//         const latDiff = targetRef.current.lat - rider.lat;
//         const lngDiff = targetRef.current.lng - rider.lng;

//         if (Math.abs(latDiff) > 0.00001 || Math.abs(lngDiff) > 0.00001) {
//           setRider((prev) =>
//             prev
//               ? {
//                   ...prev,
//                   lat: prev.lat + latDiff * speed,
//                   lng: prev.lng + lngDiff * speed,
//                 }
//               : null
//           );
//         }
//       }
//       animationFrame = requestAnimationFrame(animate);
//     };

//     animationFrame = requestAnimationFrame(animate);
//     return () => cancelAnimationFrame(animationFrame);
//   }, [rider]);

//   const center: [number, number] = rider
//     ? [rider.lat, rider.lng]
//     : [12.97, 77.59];

//   return (
//     <div style={{ height: "100vh", width: "100%" }}>
//       <MapContainer center={center} zoom={16} style={{ height: "100%", width: "100%" }}>
//         <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
//         {rider && (
//           <Marker position={[rider.lat, rider.lng]} icon={riderIcon}>
//             <Popup>
//               <div>
//                 <strong>{rider.riderId}</strong>
//                 <br />
//                 Updated: {rider.updatedAt ?? "—"}
//               </div>
//             </Popup>
//           </Marker>
//         )}
//         {rider && <Recenter lat={rider.lat} lng={rider.lng} />}
//       </MapContainer>
//     </div>
//   );
// }

// src/components/AdminMap.tsx
import  { useEffect, useRef, useState, type JSX } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { DivIcon } from "leaflet";
import { io, type Socket } from "socket.io-client";

type RiderLocation = {
  riderId: string;
  lat: number;
  lng: number;
  updatedAt?: string;
};

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL

// BIG emoji icon 🛵
const riderIcon = new DivIcon({
  html: `<div style="font-size:48px;">🛵</div>`,
  className: "emoji-marker",
  iconSize: [48, 48],
  iconAnchor: [24, 24],
});

// Helper to recenter the map
function Recenter({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng]);
  }, [lat, lng, map]);
  return null;
}

export default function AdminMap(): JSX.Element {
  const [rider, setRider] = useState<RiderLocation | null>(null);
  const targetRef = useRef<{ lat: number; lng: number } | null>(null);
  const socketRef = useRef<Socket | null>(null);

  // --- Initialize socket safely ---
  useEffect(() => {
    if (!socketRef.current) {
      socketRef.current = io(BACKEND_URL, { autoConnect: true });
    }

    const socket = socketRef.current;

    // Fetch initial rider
    fetch(`${BACKEND_URL}/riders`)
      .then((r) => r.json())
      .then((data: RiderLocation[]) => {
        if (data.length > 0) setRider(data[0]);
      });

    // Listen for rider location updates
    socket.on("riderLocationUpdate", (loc: RiderLocation) => {
      if (loc.riderId === "RIDER1") {
        targetRef.current = { lat: loc.lat, lng: loc.lng };
        setRider((prev) =>
          prev ? { ...prev, updatedAt: loc.updatedAt } : loc
        );
      }
    });

    return () => {
      socket.off("riderLocationUpdate");
      // optional: socket.disconnect();
    };
  }, []);

  // --- Simulate location updates every 3s ---
  useEffect(() => {
    const interval = setInterval(() => {
      const lat = 17.4401818 + Math.random() * 0.01;
      const lng = 78.3615896 + Math.random() * 0.01;

      fetch(`${BACKEND_URL}/update-location`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ riderId: "RIDER1", lat, lng }),
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // --- Smooth animation toward target location ---
  useEffect(() => {
    let animationFrame: number;

    const animate = () => {
      if (rider && targetRef.current) {
        const speed = 0.05; // smaller = slower
        const latDiff = targetRef.current.lat - rider.lat;
        const lngDiff = targetRef.current.lng - rider.lng;

        if (Math.abs(latDiff) > 0.00001 || Math.abs(lngDiff) > 0.00001) {
          setRider((prev) =>
            prev
              ? {
                  ...prev,
                  lat: prev.lat + latDiff * speed,
                  lng: prev.lng + lngDiff * speed,
                }
              : null
          );
        }
      }
      animationFrame = requestAnimationFrame(animate);
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [rider]);

  const center: [number, number] = rider
    ? [rider.lat, rider.lng]
    : [17.4401818, 78.3615896];

  return (
    <div style={{ height: "100vh", width: "100%" }}>
      <MapContainer center={center} zoom={16} style={{ height: "100%", width: "100%" }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {rider && (
          <Marker position={[rider.lat, rider.lng]} icon={riderIcon}>
            <Popup>
              <div>
                <strong>{rider.riderId}</strong>
                <br />
                Updated: {rider.updatedAt ?? "—"}
              </div>
            </Popup>
          </Marker>
        )}
        {rider && <Recenter lat={rider.lat} lng={rider.lng} />}
      </MapContainer>
    </div>
  );
}
