"use client";

import { useEffect, useState } from "react";
import axios from "axios";

/** 單一活動項目 */
export function Activityli({ id, Activity_name, times, Activity_end_date }) {
  function handlebutton(times){
    if(times==0){
      return (
        <li className="list-group-item bg-transparent text-light">
          <button className="btn btn-info" style={{pointerEvents:"none"}}>不可點擊</button>
        </li>
      )
    }else if(times>0){
      return(
        <li className="list-group-item bg-transparent text-light">
          <button className="btn btn-info" key={id}>點擊抽獎</button>
        </li>
      )
    }
  }
  return (
    <li className="list-group-item bg-transparent text-light">
      <a
        href={`#active${id}`}
        className="text-light text-decoration-none d-flex justify-content-between align-items-center"
        data-bs-toggle="collapse"
        aria-controls={`active${id}`}   // ← 這裡不要加 #
      >
        {Activity_name}
      </a>

      <ul className="list-group list-group-flush ps-3 collapse" id={`active${id}`}>
        <li className="list-group-item bg-transparent text-light">
          抽獎次數: {times ?? 0}
        </li>
        <li className="list-group-item bg-transparent text-light">
          抽獎日期: {Activity_end_date ?? "-"}
        </li>
        {handlebutton(times)}
      </ul>
    </li>
  );
}

/** 活動清單容器 */
export function Activity() {
  const [items, setItems] = useState([]);   // [{id, Activity_name, Activity_end_date, times}]
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  useEffect(() => {
    let alive = true;
    const base = process.env.NEXT_PUBLIC_API_BASE_URL || window.location.origin;

    (async () => {
      try {
        // 1) 拿活動清單（假設回陣列）
        const { data: activities } = await axios.get(
          `${base.replace(/\/$/, "")}/api/GetAllActivityView/`,
          { headers: { "Content-Type": "application/json" } }
        );
        
        // 2) 並行拿每個活動的抽獎次數（依你的後端路由調整）
        const enriched = await Promise.all(
          activities.map(async (a) => {
            try {
              const token=localStorage.getItem("accessToken")
              const { data: c } = await axios.get(
                `${base.replace(/\/$/, "")}/api/${a.id}/lottery/count/`,
                { headers: { "Content-Type": "application/json" ,
                  Authorization: `Bearer ${token}`
                } ,
                
            }
              );
              return { ...a, times: c?.times ?? 0 };
            } catch {
              return { ...a, times: 0 }; // 失敗就 0，不讓整體中斷
            }
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
        />
      ))}
      {items.length === 0 && (
        <li className="list-group-item bg-transparent text-light">目前沒有活動</li>
      )}
    </ul>
  );
}
