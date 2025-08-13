'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Header } from "@/components/header"
import { getAllActivity } from '@/utils/api'

const Task = () => {
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const data = await getAllActivity()
        setActivities(data)
      } catch (err) {
        setError("無法取得活動資料")
      } finally {
        setLoading(false)
      }
    }
    fetchActivities()
  }, [])

  if (loading) return (<><Header /><div className="container my-5 text-center">載入中...</div></>)
  if (error) return (<><Header /><div className="container my-5 text-danger text-center">{error}</div></>)

  return (
    <>
      <Header />
      <section className="container my-5">
        <div className="row g-4">
          {activities.map(activity => (
            <div className="col-md-4" key={activity.id}>
              <Link
                href={`/details/${activity.id}`}
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                <div className="card h-100" style={{ cursor: 'pointer' }}>
                  <div className="card-body">
                    <h5 className="card-title">{activity.Activity_name}</h5>
                    <p className="card-text">{activity.descripe}</p>
                    {activity.address && (
                      <p className="card-text">
                        <small>📍 {activity.address}</small>
                      </p>
                    )}
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </section>
    </>
  )
}

export default Task
