// app/getevents/page.jsx
"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import axios from "axios";

// 父元件：只負責提供 Suspense 邊界
export default function GetEventsPage() {
  return (
    <Suspense fallback={<div className="container py-5">讀取查詢參數中…</div>}>
      <GetEventsContent />
    </Suspense>
  );
}

// 子元件：實際使用 useSearchParams（被 Suspense 包住）
function GetEventsContent() {
  const sp = useSearchParams();
  const id = sp.get("id");
  const [event, setEvent] = useState(null);
  const [err, setErr] = useState("");

  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("accessToken") || localStorage.getItem("access_token")
      : null;

  // 🔧 安全組 URL：避免 NEXT_PUBLIC_API_BASE_URL 已含 /api 時變成 /api/api/...
  const apiBase = (process.env.NEXT_PUBLIC_API_BASE_URL || "").replace(/\/+$/, "");
  const recordUrl = `${apiBase.replace(/\/api$/, "")}/api/records/${id}/`;

  const fmtTime = (s) => {
    if (!s) return "";
    const d = new Date(s);
    const pad = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  useEffect(() => {
    if (!id) {
      setErr("缺少事件 id");
      return;
    }
    axios
      .get(recordUrl, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      .then((res) => setEvent(res.data))
      .catch((e) => {
        const s = e?.response?.status;
        setErr(
          s === 401 ? "請註冊後才可以觀看" :
          s === 404 ? "找不到事件" :
          "載入失敗"
        );
      });
  }, [id, token, recordUrl]);

  const levelBadge = useMemo(() => {
    if (!event) return null;
    const map = { 1: ["低", "bg-success"], 2: ["中", "bg-warning text-dark"], 3: ["高", "bg-danger"] };
    const [txt, cls] = map[event.level] || ["未知", "bg-secondary"];
    return <span className={`badge ${cls} ms-2`}>等級 {event.level}（{txt}）</span>;
  }, [event]);

  if (err) return <div className="container py-5 text-danger">{err}</div>;

  if (!event) {
    return (
      <div className="container py-5">
        <div className="placeholder-wave">
          <div className="placeholder col-6 mb-3" style={{ height: 36 }} />
          <div className="placeholder col-12" style={{ height: 300 }} />
          <div className="placeholder col-8 mt-3" />
          <div className="placeholder col-5 mt-2" />
        </div>
      </div>
    );
  }

  const imgSrc = event.event_image_url || event.event_image || "/img/placeholder.jpg";

  return (
    <div className="container py-4" style={{ maxWidth: 900 }}>
      <div className="d-flex align-items-center mb-3">
        <button className="btn btn-outline-secondary me-2" onClick={() => history.back()}>← 返回</button>
        <h3 className="m-0">{event.event_name}{levelBadge}</h3>
      </div>

      <div className="card shadow-sm">
        <div className="row g-0">
          <div className="col-12 col-md-6">
            <img
              src={imgSrc}
              className="img-fluid rounded-start w-100"
              style={{ objectFit: "cover", height: "100%" }}
              alt={event.event_name}
              onError={(e) => { e.currentTarget.src = "/img/placeholder.jpg"; }}
            />
          </div>
          <div className="col-12 col-md-12">
            <div className="card-body">
              <p className="mb-2"><strong>地址：</strong>{event.address || "—"}</p>
              <p className="mb-2"><strong>發生時間：</strong>{fmtTime(event.event_occurs_time) || "—"}</p>
              <p className="mb-3"><strong>建立時間：</strong>{fmtTime(event.created_at) || "—"}</p>
              <div className="border-top pt-3" style={{ whiteSpace: "pre-wrap" }}>
                <strong>描述：</strong>
                <div className="mt-2">{event.descriptions || "（無）"}</div>
              </div>
              {event.formatted_address && (
                <p className="text-muted mt-3 small">正規化地址：{event.formatted_address}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
