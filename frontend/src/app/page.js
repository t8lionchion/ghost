"use client";
import axios from "axios";
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from "next/navigation"
import {
  APIProvider,
  Map,
  useMap,
  AdvancedMarker,
} from '@vis.gl/react-google-maps';
import { Circle } from './components/circle';

// 取得資料 API
const fetchLocations = async () => {
  const res = await axios.get(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/records/locations/public`,
    { headers: { 'Content-Type': 'application/json' } }
  );

  const data = Array.isArray(res.data) ? res.data : [];
  return data.map(item => ({
    key: Number(item.id),
    location: { lat: Number(item.lat), lng: Number(item.lng) }, // 修正 lmg → lng
    level: Number(item.level),
  }));
};

// PoiMarkers 元件
function PoiMarkers({ pois }) {
  const map = useMap();
  const [markers, setMarkers] = useState({});
  const [circleCenter, setCircleCenter] = useState(null);
  const router = useRouter()
  const handleClick = useCallback((poi) => {
    if (map && poi?.location) {
      map.panTo(poi.location);
      setCircleCenter(poi.location);
    }
    // 這裡用事件 id 跳轉到詳情頁
    console.log("click poi:", poi);    
    router.push(`/getevents?id=${encodeURIComponent(poi)}`);
  }, [map, router]);

  function setMarkerRef(marker, key) {
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
      {pois.map(poi => (
        <AdvancedMarker
          key={poi.key}
          position={poi.location}
          ref={marker => setMarkerRef(marker, poi.key)}
          clickable
          onClick={() => handleClick(poi.key)}
          options={{
            title: poi.key,
            zIndex: 10,
          }}
        >
          {poi.level === 1 && <img src="/img/level1.png" width={32} height={32} alt={poi.key} />}
          {poi.level === 2 && <img src="/img/level2.png" width={32} height={32} alt={poi.key} />}
          {poi.level === 3 && <img src="/img/level3.png" width={32} height={32} alt={poi.key} />}
        </AdvancedMarker>
      ))}
    </>
  );
}

// 設定台灣地圖範圍
function TaiwanBounds() {
  const map = useMap();
  useEffect(() => {
    if (!map) return;
    const bounds = new google.maps.LatLngBounds(
      { lat: 21.8, lng: 119.5 },
      { lat: 25.3, lng: 122.0 }
    );
    map.fitBounds(bounds);
  }, [map]);
  return null;
}

export default function Home() {
  const [locations, setLocations] = useState([]); // 一開始是陣列
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLocations()
      .then(data => setLocations(data))
      .catch(err => console.error("載入地點失敗:", err))
      .finally(() => setLoading(false));
  }, []);
  const router = useRouter();
  return (
    <>
      <div className='container mb-4 mt-4 d-flex justify-content-end'>
        <button className='btn btn-info' onClick={() => router.push('/postevents')}>上報事件</button>
      </div>
      <div id="app" className="map-container">
        <APIProvider
          apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}
          onLoad={() => console.log('Maps API has loaded.')}
        >
          <Map defaultCenter={{ lat: 23.5, lng: 121 }} defaultZoom={7} mapId="#">
            {!loading && <PoiMarkers pois={locations} />}
            <TaiwanBounds />
          </Map>
        </APIProvider>
      </div>
    </>
  );
}
