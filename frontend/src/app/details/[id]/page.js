'use client'
import { useEffect, useState, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { getActivityById, getActivityGate, postActivityCheckin } from '@/utils/api'
import { Header } from '@/components/header'

export default function DetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const mounted = useRef(true)

  const [activity, setActivity] = useState(null)
  const [gateResp, setGateResp] = useState(null) // { geo_enabled, verified, gate: {...} }
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [checking, setChecking] = useState(false)

  useEffect(() => {
    mounted.current = true
    const run = async () => {
      if (!id) return
      try {
        const [detail, gateInfo] = await Promise.all([
          getActivityById(id),
          getActivityGate(id),
        ])
        if (!mounted.current) return
        setActivity(detail)
        setGateResp(gateInfo)
      } catch (e) {
        setError('無法取得活動資料/定位門檻，請確認是否已登入或活動是否存在')
      } finally {
        setLoading(false)
      }
    }
    run()
    return () => { mounted.current = false }
  }, [id])

  const getCurrentPosition = () =>
    new Promise((resolve, reject) => {
      if (!navigator.geolocation) return reject(new Error('此裝置不支援定位'))
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      })
    })

  const handleStart = async () => {
    if (!id) return
    const gate = gateResp && gateResp.gate
    if (!gate) {
      setError('活動尚未設定定位門檻，或門檻載入失敗')
      return
    }
    if (gateResp && gateResp.geo_enabled === false) {
      setError('此活動未啟用定位檢查，請聯絡主辦單位')
      return
    }

    setChecking(true)
    setError(null)
    try {
      const pos = await getCurrentPosition()
      const res = await postActivityCheckin(String(id), {
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
      })
      if (res && res.ok) {
        router.push(`/play/${id}`)
      } else {
        const msg = (res && res.message) || `未通過定位門檻（距離 ${(res && res.radius_m) ?? '?'} 公尺）`
        setError(msg)
      }
    } catch (e) {
      if (e && e.code === 1) setError('定位被拒絕，請允許存取位置')
      else if (e && e.code === 2) setError('定位失敗，請確認網路或 GPS 訊號')
      else if (e && e.code === 3) setError('定位逾時，請在戶外或重新嘗試')
      else setError('開始前定位或簽到失敗，請稍後再試')
    } finally {
      setChecking(false)
    }
  }

  const formatDate = (isoString) => {
    const d = new Date(isoString)
    return d.toLocaleString('zh-TW', {
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit'
    })
  }

  if (loading) return <div className="container my-5 text-center">載入中...</div>
  if (error) return (
    <div className="container my-5 text-center">
      <div className="text-danger mb-3">{error}</div>
      <button className="btn btn-outline-light" onClick={() => location.reload()}>重新整理</button>
    </div>
  )
  if (!activity) return null

  const gate = gateResp && gateResp.gate

  return (
    <>
      <Header />
      <section className="container my-5" style={{ maxWidth: 600, background: '#111111ff', borderRadius: 12, padding: 24 }}>
        <div>
          <div style={{ fontWeight: 600, fontSize: 20, marginBottom: 16 }}>{activity.Activity_name}</div>
          <div style={{ marginBottom: 18 }}>{activity.descripe}</div>
          <div style={{ marginBottom: 8 }}>開始時間：{formatDate(activity.Activity_start_date)}</div>
          <div style={{ marginBottom: 20 }}>結束時間：{formatDate(activity.Activity_end_date)}</div>

          {gate && (
            <div className="text-secondary" style={{ fontSize: 14, marginBottom: 12 }}>
              門檻：{gate.title}｜lat {gate.lat}, lng {gate.lng}（半徑 {gate.radius_m} m）
            </div>
          )}

          <button
            type="button"
            disabled={checking}
            style={{
              background: checking ? '#7fbf88' : '#359943',
              color: '#222',
              fontWeight: 600,
              border: 'none',
              borderRadius: '6px',
              padding: '12px 24px',
              fontSize: 16,
              cursor: checking ? 'not-allowed' : 'pointer'
            }}
            onClick={handleStart}
          >
            {checking ? '檢查定位中…' : '到達現場後開始'}
          </button>
        </div>
      </section>
    </>
  )
}
