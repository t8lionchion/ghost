"use client";
import axios from "axios";
import React, { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  APIProvider,
  Map,
  useMap,
  AdvancedMarker,
} from "@vis.gl/react-google-maps";
import {GuideModal} from './components/Guidemodal';
import { Circle } from "./components/circle"; // 目前未用到，可視需要保留

// ── 小工具：台灣時間格式化 ───────────────────────────────
function formatTW(iso) {
  if (!iso) return "-";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "-";
  return new Intl.DateTimeFormat("zh-TW", {
    timeZone: "Asia/Taipei",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })
    .format(d)
    .replaceAll("/", "-");
}

// ── 右側滑出面板：鬼怪等級說明 ──────────────────────────
function LegendPanel({ open, onClose }) {
  return (
    <>
      {/* 背景遮罩 */}
      {open && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100"
          style={{ background: "rgba(0,0,0,.35)", zIndex: 1040 }}
          onClick={onClose}
        />
      )}

      {/* 右側面板 */}
      <aside
        className="position-fixed top-0 end-0 h-100 bg-dark text-light shadow"
        style={{
          width: 320,
          zIndex: 1050,
          transform: open ? "translateX(0)" : "translateX(100%)",
          transition: "transform .25s ease",
        }}
        aria-hidden={!open}
        aria-label="鬼怪等級說明"
      >
        <div className="d-flex align-items-center justify-content-between p-3 border-bottom border-secondary">
          <h5 className="m-0">鬼怪等級說明</h5>
          <button className="btn btn-sm btn-outline-light" onClick={onClose}>
            關閉
          </button>
        </div>

        <div className="p-3 small">
          <p className="text-secondary mb-2">
            等級用於表示地點的體驗風險與靈異強度，請量力而為。
          </p>

          <ul className="list-unstyled">
            <li className="d-flex align-items-start mb-3">
              <img src="/img/level1.png" width={28} height={28} alt="Lv1" className="me-2" />
              <div>
                <div className="fw-semibold">等級 1（低）</div>
                <div className="text-secondary">
                  入門級景點，偶有傳聞；適合新手結伴體驗。
                </div>
              </div>
            </li>
            <li className="d-flex align-items-start mb-3">
              <img src="/img/level2.png" width={28} height={28} alt="Lv2" className="me-2" />
              <div>
                <div className="fw-semibold">等級 2（中）</div>
                <div className="text-secondary">
                  傳聞較多或環境較複雜；建議日間偵察、做好路線規劃。
                </div>
              </div>
            </li>
            <li className="d-flex align-items-start mb-3">
              <img src="/img/level3.png" width={28} height={28} alt="Lv3" className="me-2" />
              <div>
                <div className="fw-semibold">等級 3（高）</div>
                <div className="text-secondary">
                  高風險或強烈傳聞；務必結伴、準備照明與通訊，避免單獨前往。
                </div>
              </div>
            </li>
          </ul>

          <hr className="border-secondary" />
          <div className="text-secondary">
            <div className="fw-semibold mb-1">安全提醒</div>
            <ul className="ps-3 mb-0">
              <li>遵守法律與私人土地禁入規定。</li>
              <li>夜間或偏遠地點務必結伴而行。</li>
              <li>攜帶基本裝備：照明、行動電源、急救用品。</li>
            </ul>
          </div>
        </div>
      </aside>

      {/* 右側浮動問號按鈕 */}
      <button
        className="btn btn-dark position-fixed top-50 end-0 translate-middle-y me-2 rounded-pill shadow"
        style={{ zIndex: 1060 }}
        onClick={open ? onClose : () => onClose(false) || null /* placeholder */}
      >
        ？
      </button>
    </>
  );
}

// 取得資料 API
const fetchLocations = async () => {
  const res = await axios.get(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/records/locations/public/`
  );
  const data = Array.isArray(res.data) ? res.data : [];
  return data.map((item) => ({
    key: Number(item.id),
    location: { lat: Number(item.lat), lng: Number(item.lng) },
    level: Number(item.level),
  }));
};

// PoiMarkers 元件
function PoiMarkers({ pois }) {
  const map = useMap();
  const [markers, setMarkers] = useState({});
  const [circleCenter, setCircleCenter] = useState(null);
  const router = useRouter();

  const handleClick = useCallback(
    (poi) => {
      if (map && poi?.location) {
        map.panTo(poi.location);
        setCircleCenter(poi.location);
      }
      // 這裡用事件 id 跳轉到詳情頁（修掉 encode 整個物件的問題）
      router.push(`/getevents?id=${poi.key}`);
    },
    [map, router]
  );

  function setMarkerRef(marker, key) {
    if (marker && markers[key] === marker) return;
    if (!marker && !markers[key]) return;
    setMarkers((prev) => {
      const next = { ...prev };
      if (marker) next[key] = marker;
      else delete next[key];
      return next;
    });
  }

  return (
    <>
      {pois.map((poi) => (
        <AdvancedMarker
          key={poi.key}
          position={poi.location}
          ref={(marker) => setMarkerRef(marker, poi.key)}
          clickable
          onClick={() => handleClick(poi)}
          options={{ title: String(poi.key), zIndex: 10 }}
        >
          {poi.level === 1 && (
            <img src="/img/level1.png" width={32} height={32} alt="Lv1" />
          )}
          {poi.level === 2 && (
            <img src="/img/level2.png" width={32} height={32} alt="Lv2" />
          )}
          {poi.level === 3 && (
            <img src="/img/level3.png" width={32} height={32} alt="Lv3" />
          )}
        </AdvancedMarker>
      ))}
      {/* 如果你要畫圓，可在這裡使用 <Circle center={circleCenter} .../> */}
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
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [legendOpen, setLegendOpen] = useState(false);
  const [introOpen, setIntroOpen] = useState(false); // ← 新增：引導視窗開關
  useEffect(() => {
    fetchLocations()
      .then((data) => setLocations(data))
      .catch((err) => console.error("載入地點失敗:", err))
      .finally(() => setLoading(false));
  }, []);
  // ← 新增：第一次進頁才顯示（用 localStorage 記憶）
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!localStorage.getItem("ghostmove_intro_done")) {
      setIntroOpen(true);
    }
  }, []);
  const router = useRouter();

  return (
    <>
       {/* ← 新增：引導視窗（可關閉、可記憶） */}
      <GuideModal open={introOpen} onClose={() => setIntroOpen(false)} />
      <div className="container mb-4 mt-4 d-flex justify-content-between align-items-center">
        <div className="text-light small">
          {/* 可選：顯示更新時間或公告 */}
        </div>
        <button className="btn btn-info" onClick={() => router.push("/postevents")}>
          上報事件
        </button>
      </div>

      <div id="app" className="map-container position-relative">
        {/* 右側說明面板與浮動按鈕 */}
        <LegendPanel open={legendOpen} onClose={() => setLegendOpen(!legendOpen)} />

        <APIProvider
          apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}
          onLoad={() => console.log("Maps API has loaded.")}
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
