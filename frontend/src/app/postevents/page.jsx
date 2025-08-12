"use client";
import React, { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation"
export default function ReportEventForm() {
  const router = useRouter()
  const [form, setForm] = useState({
    event_name: "",
    address: "",
    event_occurs_time: "",
    level: "1",
    descriptions: "",
    is_active: false,
  });
  const [file, setFile] = useState(null);
  const [imgPreview, setImgPreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const API = process.env.NEXT_PUBLIC_API_BASE_URL; 

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((s) => ({ ...s, [name]: type === "checkbox" ? checked : value }));
  };

  const onFile = (e) => {
    const f = e.target.files && e.target.files[0] ? e.target.files[0] : null;
    setFile(f);
    setImgPreview(f ? URL.createObjectURL(f) : null);
  };

  const validate = () => {
    if (!form.event_name.trim()) return "請填寫事件名稱";
    if (!form.address.trim()) return "請填寫地址";
    if (!form.event_occurs_time) return "請選擇事件時間";
    if (!form.level) return "請選擇等級";
    if (!form.descriptions.trim()) return "請填寫描述";
    return "";
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const msg = validate();
    if (msg) return alert(msg);

    const fd = new FormData();
    fd.append("event_name", form.event_name);
    if (file) fd.append("event_image", file); // 圖片選填
    fd.append("address", form.address);

    // datetime-local → ISO
    const iso = new Date(form.event_occurs_time).toISOString();
    fd.append("event_occurs_time", iso);

    fd.append("level", String(Number(form.level)));
    fd.append("descriptions", form.descriptions);

    setSubmitting(true);
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
      const res = await axios.post(`${API}/api/records/reports/`, fd, {
        headers: { Authorization: token ? `Bearer ${token}` : "" },
      });
      alert("上報成功！");
      console.log(res.data);

      // 重置
      setForm({
        event_name: "",
        address: "",
        event_occurs_time: "",
        level: "1",
        descriptions: "",
        is_active: false,
      });
      setFile(null);
      setImgPreview(null);
      router.push('/')
    } catch (err) {
      console.error(err);
      const detail =
        (err.response && (err.response.data.message || err.response.data.detail)) ||
        JSON.stringify(err.response ? err.response.data : {});
      alert("上報失敗：" + detail);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="container" style={{ maxWidth: 720 }}>
      <h4 className="mt-3 mb-3">上報事件</h4>

      <div className="mb-3">
        <label className="form-label">事件名稱</label>
        <input
          name="event_name"
          value={form.event_name}
          onChange={onChange}
          className="form-control"
          placeholder="例：辛亥隧道靈異事件"
          required
        />
      </div>

      <div className="mb-3">
        <label className="form-label">事件圖片（選填）</label>
        <input type="file" accept="image/*" onChange={onFile} className="form-control" />
        {imgPreview && (
          <img src={imgPreview} alt="preview" className="mt-2 rounded" style={{ maxHeight: 160 }} />
        )}
      </div>

      <div className="mb-3">
        <label className="form-label">地址</label>
        <input
          name="address"
          value={form.address}
          onChange={onChange}
          className="form-control"
          placeholder="例：台北市大安區辛亥路五段"
          required
        />
      </div>

      <div className="mb-3">
        <label className="form-label">發生時間</label>
        <input
          type="datetime-local"
          name="event_occurs_time"
          value={form.event_occurs_time}
          onChange={onChange}
          className="form-control"
          required
        />
      </div>

      <div className="mb-3">
        <label className="form-label">等級</label>
        <select name="level" value={form.level} onChange={onChange} className="form-select" required>
          <option value="1">1（低）</option>
          <option value="2">2（中）</option>
          <option value="3">3（高）</option>
        </select>
      </div>

      <div className="mb-3">
        <label className="form-label">描述</label>
        <textarea
          name="descriptions"
          value={form.descriptions}
          onChange={onChange}
          className="form-control"
          rows="4"
          placeholder="請輸入至少 20 字的描述"
          required
        />
      </div>

      

      <button className="btn btn-primary mb-4" disabled={submitting}>
        {submitting ? "送出中…" : "送出上報"}
      </button>
    </form>
  );
}
