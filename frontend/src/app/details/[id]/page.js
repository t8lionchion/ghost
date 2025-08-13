'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { getActivityById } from '@/utils/api'
import {Header} from '@/components/header'
const DetailPage = () => {
  const params = useParams()
  const router = useRouter()
  const { id } = params

  const [activity, setActivity] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const data = await getActivityById(id)
        setActivity(data)
      } catch (e) {
        setError('無法取得活動資料，請確認是否已登入或活動是否存在')
      } finally {
        setLoading(false)
      }
    }
    if (id) fetchDetail()
  }, [id])

  // 日期格式轉換（年月日 時:分）
  const formatDate = (isoString) => {
    const d = new Date(isoString)
    return d.toLocaleString('zh-TW', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
  }

  if (loading) return <div className="container my-5 text-center">載入中...</div>
  if (error) return <div className="container my-5 text-danger text-center">{error}</div>
  if (!activity) return null

  return (
    <>
      <Header/>
      <section className="container my-5" style={{ maxWidth: 600, background: '#111111ff', borderRadius: 12, padding: 24 }}>
        <div>
          <div style={{ fontWeight: 600, fontSize: 20, marginBottom: 16 }}>{activity.Activity_name}</div>
          <div style={{ marginBottom: 18 }}>{activity.descripe}</div>
          <div style={{ marginBottom: 8 }}>開始時間：{formatDate(activity.Activity_start_date)}</div>
          <div style={{ marginBottom: 20 }}>結束時間：{formatDate(activity.Activity_end_date)}</div>
          <button
            type="button"
            style={{
              background: '#359943',
              color: '#222',
              fontWeight: 500,
              border: 'none',
              borderRadius: '4px',
              padding: '12px 24px',
              fontSize: 16,
              cursor: 'pointer'
            }}
            onClick={() => alert('開始遊玩功能待實作')}
          >
            開始遊玩活動按鈕
          </button>
        </div>
      </section>
    </>
  )
}

export default DetailPage
