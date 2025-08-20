"use client"
import React from "react";
export function GuideModal({ open, onClose }) {
  const [dontShow, setDontShow] = React.useState(false);

  React.useEffect(() => {
    const onEsc = (e) => e.key === "Escape" && onClose();
    if (open) document.addEventListener("keydown", onEsc);
    return () => document.removeEventListener("keydown", onEsc);
  }, [open, onClose]);

  if (!open) return null;

  const closeAndRemember = () => {
    if (typeof window !== "undefined" && dontShow) {
      localStorage.setItem("ghostmove_intro_done", "1");
    }
    onClose();
  };

  return (
    <>
      {/* 背景遮罩 */}
      <div
        className="position-fixed top-0 start-0 w-100 h-100"
        style={{ background: "rgba(0,0,0,.55)", zIndex: 2000 }}
        onClick={closeAndRemember}
      />
      {/* 中央視窗 */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="guide-title"
        className="position-fixed top-50 start-50 translate-middle bg-white text-dark shadow rounded-3"
        style={{ width: "min(560px, 92vw)", zIndex: 2001 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-3 border-bottom d-flex justify-content-between align-items-center">
          <h5 id="guide-title" className="m-0">如何查看靈異事件</h5>
          <button className="btn btn-sm btn-outline-secondary" onClick={closeAndRemember}>關閉</button>
        </div>

        <div className="p-3">
          <ol className="mb-3">
            <li className="mb-2">拖曳、縮放 <strong>地圖</strong>（畫面左側）尋找紅色圖示。</li>
            <li className="mb-2">點擊任一 <strong>紅色圖示</strong>（事件標記）。</li>
            <li className="mb-2">右側的 <strong>事件面板</strong> 會顯示名稱、敘述與圖片。</li>
            <li className="mb-2">記得要登入 <strong>才可以使用此功能喔</strong> 不然事件面板的鬼怪圖示是不可以點擊的</li>
          </ol>

          <div className="form-check mb-3">
            <input id="dontShow" className="form-check-input" type="checkbox"
                   checked={dontShow} onChange={(e)=>setDontShow(e.target.checked)} />
            <label htmlFor="dontShow" className="form-check-label">下次不要再顯示</label>
          </div>

          <div className="d-flex gap-2 justify-content-end">
            <button className="btn btn-outline-secondary" onClick={onClose}>稍後再看</button>
            <button className="btn btn-primary" onClick={closeAndRemember}>開始探索</button>
          </div>
        </div>
      </div>
    </>
  );
}
