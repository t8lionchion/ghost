'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Header } from "@/components/header"
import { getAllActivity } from '@/utils/api'

function getActivityState(a) {
  // 回傳 'upcoming' | 'ongoing' | 'ended'
  const now = new Date()
  const start = a?.Activity_start_date ? new Date(a.Activity_start_date) : null
  const end   = a?.Activity_end_date   ? new Date(a.Activity_end_date)   : null
  if (start && now < start) return 'upcoming'
  if (end && now > end)     return 'ended'
  return 'ongoing'
}

const Task = () => {
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const data = await getAllActivity()
        setActivities(data)
      } catch {
        setError("無法取得活動資料")
      } finally {
        setLoading(false)
      }
    }
    fetchActivities()
  }, [])

  if (loading) return (<><Header /><div className="container my-5 text-center">載入中...</div></>)
  if (error)   return (<><Header /><div className="container my-5 text-danger text-center">{error}</div></>)

  function handleClick(e) {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      e.preventDefault();
      alert("請先登入後再查看詳情");
    }
  }

  return (
    <>
      <Header />
      <section className="container my-5">
        <div className="row g-4">
          {activities.map(activity => {
            const state = getActivityState(activity)
            const canClick = state === 'ongoing'

            const Card = (
              <div
                className={`card h-100 ${canClick ? '' : 'opacity-50'}`}
                style={{ cursor: canClick ? 'pointer' : 'not-allowed' }}
                title={canClick ? '' : (state === 'upcoming' ? '活動尚未開始' : '活動已結束')}
              >
                <div className="card-body">
                  <h5 className="card-title d-flex align-items-center justify-content-between">
                    <span>{activity.Activity_name}</span>
                    <span className={`badge ${
                      state === 'ongoing' ? 'text-bg-success' :
                      state === 'upcoming' ? 'text-bg-info' : 'text-bg-secondary'
                    }`}>
                      {state === 'ongoing' ? '進行中' : state === 'upcoming' ? '未開始' : '已結束'}
                    </span>
                  </h5>
                  <p className="card-text">{activity.descripe}</p>
                  {activity.address && (
                    <p className="card-text"><small>📍 {activity.address}</small></p>
                  )}
                </div>
              </div>
            )

            return (
              <div className="col-md-4" key={activity.id}>
                {canClick ? (
                  <Link
                    href={`/details/${activity.id}`}
                    style={{ textDecoration: 'none', color: 'inherit' }}
                    onClick={handleClick}
                  >
                    {Card}
                  </Link>
                ) : (
                  // 不可點擊時不包 Link（完全禁止導向）
                  <div
                    onClick={() => {
                      // 若你想彈提醒就保留，若完全靜默就刪掉這行
                      alert(state === 'upcoming' ? '活動尚未開始' : '活動已結束')
                    }}
                    style={{ textDecoration: 'none', color: 'inherit' }}
                  >
                    {Card}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </section>
    </>
  )
}

export default Task
