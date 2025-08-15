"use client";

import { useEffect, useState } from "react";
import axios from "axios";

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
    second: "2-digit",
    hour12: false,
  }).format(d).replaceAll("/", "-"); // → 2025-08-15 01:58:41
}
/** 單一活動項目 */
export function Activityli({ id, Activity_name, times, Activity_end_date, lottery }) {
  const [result, setResult] = useState(lottery);
  const [loading, setLoading] = useState(false);

  // 父層資料變動時同步
  useEffect(() => {
    setResult(lottery);
  }, [lottery]);

  function renderLottery(l) {
    if (!l) return null;
    if (!l.has_participated) return <span className="badge text-bg-warning">尚未參加</span>;
    if (!l.latest) return <span className="badge text-bg-secondary">待開獎</span>;
    if (l.latest.is_winning) {
      return (
        <span className="badge text-bg-success">
          🎉 中獎{l.latest.prize ? `：${l.latest.prize}` : ""}（{new Date(l.latest.created_at).toLocaleString()}）
        </span>
      );
    }
    return (
      <span className="badge text-bg-light text-dark">
        未中獎（{new Date(l.latest.created_at).toLocaleString()}）
      </span>
    );
  }

  // 只刷新我的抽獎結果（不重載整頁）
  async function refreshMyLottery() {
    const base = (process.env.NEXT_PUBLIC_API_BASE_URL || window.location.origin).replace(/\/$/, "");
    const token = localStorage.getItem("accessToken");
    if (!token) return;

    try {
      const { data: d } = await axios.get(
        `${base}/api/activities/${id}/my-lottery/?latest=1`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const latest =
        d.latest ??
        (Array.isArray(d.results) && d.results.length > 0 ? d.results[0] : null);
      const has_participated =
        typeof d.has_participated === "boolean" ? d.has_participated : (d.count ?? 0) > 0;

      setResult({
        activity_id: d.activity_id ?? id,
        latest,
        has_participated,
      });
    } catch (e) {
      console.error(e);
    }
  }

  // 管理員觸發「開獎」後，立即刷新顯示
  async function handleDraw() {
    const base = (process.env.NEXT_PUBLIC_API_BASE_URL || window.location.origin).replace(/\/$/, "");
    const token = localStorage.getItem("accessToken");
    if (!token) {
      alert("請先登入管理員帳號");
      return;
    }
    try {
      setLoading(true);
      await axios.post(
        `${base}/api/lotteries/admin/activities/${id}/draw/`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await refreshMyLottery();
      alert("開獎完成！");
    } catch (e) {
      console.error(e);
      alert("開獎失敗");
    } finally {
      setLoading(false);
    }
  }


  return (
    <li className="list-group-item bg-transparent text-light">
      <a
        href={`#active${id}`}
        className="text-light text-decoration-none d-flex justify-content-between align-items-center"
        data-bs-toggle="collapse"
        aria-controls={`active${id}`}
      >
        {Activity_name}
      </a>

      <ul className="list-group list-group-flush ps-3 collapse" id={`active${id}`}>
        <li className="list-group-item bg-transparent text-light">抽獎次數：{times ?? 0}</li>
        <li className="list-group-item bg-transparent text-light">
          抽獎日期：{formatTW(Activity_end_date)}
        </li>

        <li className="list-group-item bg-transparent text-light">
          抽獎結果：{renderLottery(result)}
          {/* 也可以在折疊展開時刷新： */}
          <button className="btn btn-sm btn-outline-light ms-2" onClick={refreshMyLottery}>
            重新整理
          </button>
        </li>

      </ul>
    </li>
  );
}

/** 活動清單容器 */
export function Activity() {
  const [items, setItems] = useState([]); // [{id, Activity_name, Activity_end_date, times, lottery}]
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  useEffect(() => {
    let alive = true;
    const base = (process.env.NEXT_PUBLIC_API_BASE_URL || window.location.origin).replace(/\/$/, "");
    (async () => {
      try {
        // 1) 取活動清單
        const { data: activities } = await axios.get(`${base}/api/GetAllActivityView/`, {
          headers: { "Content-Type": "application/json" },
        });

        // 2) 並行查每個活動的抽獎次數 + 個人抽獎結果（最新一筆）
        const token = localStorage.getItem("accessToken");
        const authHeader = token ? { Authorization: `Bearer ${token}` } : {};

        const enriched = await Promise.all(
          activities.map(async (a) => {
            const timesReq = axios
              .get(`${base}/api/${a.id}/lottery/count/`, {
                headers: { "Content-Type": "application/json", ...authHeader },
              })
              .then((res) => res.data)
              .catch(() => ({ times: 0 }));

            const myResultReq = axios
              // 這裡你可以保留 ?latest=1，但後面會做 fallback
              .get(`${base}/api/activities/${a.id}/my-lottery/?latest=1`, {
                headers: { "Content-Type": "application/json", ...authHeader },
              })
              .then((res) => res.data)
              .catch(() => ({ activity_id: a.id, latest: null, has_participated: false, results: [], count: 0 }));

            const [timesData, myData] = await Promise.all([timesReq, myResultReq]);

            // 🔧 正規化（同時支援 latest 或 results 陣列）
            const latest =
              myData.latest ??
              (Array.isArray(myData.results) && myData.results.length > 0 ? myData.results[0] : null);
            const has_participated =
              typeof myData.has_participated === "boolean"
                ? myData.has_participated
                : (myData.count ?? 0) > 0;

            return {
              ...a,
              times: timesData?.times ?? 0,
              lottery: {
                activity_id: myData.activity_id ?? a.id,
                latest,
                has_participated,
              },
            };
          })
        );
        if (alive) setItems(enriched);
      } catch (e) {
        if (alive) setErr(e?.response?.data ?? e?.message ?? "載入失敗");
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  if (loading) return <p className="text-light">載入中…</p>;
  if (err) return <p className="text-danger">錯誤：{String(err)}</p>;

  return (
    <ul className="list-group list-group-flush ps-3" id="activeInfo">
      {items.map((a) => (
        <Activityli
          key={a.id}
          id={a.id}
          Activity_name={a.Activity_name}
          times={a.times}
          Activity_end_date={a.Activity_end_date}
          lottery={a.lottery}
        />
      ))}
      {items.length === 0 && (
        <li className="list-group-item bg-transparent text-light">目前沒有活動</li>
      )}
    </ul>
  );
}
