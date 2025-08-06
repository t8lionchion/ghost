// app.jsx
"use client";
import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  APIProvider,
  Map,
  useMap,
  AdvancedMarker,
  Pin,
  AdvancedMarkerView
} from '@vis.gl/react-google-maps';
import { MarkerClusterer } from '@googlemaps/markerclusterer';
import { Circle } from './components/circle';

const locations = [
  { key: 'operaHouse', location: { lat: 25, lng: 121.2 } },

];


function PoiMarkers({ pois }) {
  const map = useMap();
  const [markers, setMarkers] = useState({});
  const clustererRef = useRef(null);
  const [circleCenter, setCircleCenter] = useState(null);

  const handleClick = useCallback(ev => {
    if (!map || !ev.latLng) return;
    map.panTo(ev.latLng);
    setCircleCenter(ev.latLng);
  }, [map]);

  // …… 省略 clusterer 初始化、清除、Circle ……

  function setMarkerRef(marker, key) {
    // 如果前後狀態一樣，就不更新
    if (marker && markers[key] === marker) return;
    if (!marker && !markers[key]) return;

    setMarkers(prev => {
      const next = { ...prev };
      if (marker) next[key] = marker;
      else delete next[key];
      return next;
    });
  }

  return (
    <>
      {/* …Circle 省略… */}
      {pois.map(poi => (
        <AdvancedMarker
          key={poi.key}
          position={poi.location}
          ref={marker => setMarkerRef(marker, poi.key)}
          clickable
          onClick={handleClick}
          options={{
            title: poi.key,       // 滑鼠移到 marker 上會顯示 tooltip
            zIndex: 10,            // 堆疊順序
          }}
        >
          
            <img
              src="/img/level1.png"
              width={32}
              height={32}
              alt={poi.key}
            />
          
        </AdvancedMarker>
      ))}
    </>
  );
}

// 1. 建一個專門做 bounds 的元件
function TaiwanBounds() {
  const map = useMap();
  useEffect(() => {
    if (!map) return;
    const bounds = new google.maps.LatLngBounds(
      { lat: 21.8, lng: 119.5 },  // 西南角
      { lat: 25.3, lng: 122.0 }   // 東北角
    );
    map.fitBounds(bounds);
  }, [map]);
  return null;
}
export default function Home() {
  return (
    <div id="app" className="map-container">
      <APIProvider
        apiKey="AIzaSyAGxuirR3w8akHVf4ctRU3AueZs_udh5LA"
        onLoad={() => console.log('Maps API has loaded.')}
      >
        <Map
          defaultCenter={{ lat: 23.5, lng: 121 }}
          defaultZoom={7}
          mapId="#"
        >
          <PoiMarkers pois={locations} />
          <TaiwanBounds /> {/* 只用這個去設定初始範圍 */}
        </Map>

      </APIProvider>
    </div>
  );
}
