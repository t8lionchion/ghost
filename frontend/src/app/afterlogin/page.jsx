"use client"
import { ComingSoonSection } from './waitdev'
import { useAuth } from "@/hooks/useAuth"
import { Header } from "../../components/header"
import { Activity } from './activity'
export default function AfterLogin() {
  const { user, logout } = useAuth()
  const SHOW_PLACEHOLDERS = true; // 之後要關掉就改 false
  return (
    <>
      <Header />
      <div className="container my-5">
        <div className="row justify-content-center">
          <div className="col-md-6">
            <div className="card bg-dark text-light border-danger shadow-lg">
              <div className="card-header text-center text-danger"
                style={{ fontFamily: 'Creepster, cursive', fontSize: '1.8rem' }}>
                會員資料
              </div>
              <ul className="list-group list-group-flush">

                {/* 個人檔案 */}
                <li className="list-group-item bg-transparent">
                  <a className="text-light text-decoration-none d-flex justify-content-between align-items-center"
                    data-bs-toggle="collapse" href="#userInfo" role="button" aria-expanded="false" aria-controls="userInfo">
                    <span className="d-flex align-items-center">
                      <i className="bi bi-person-circle fs-5 me-2"></i>
                      個人檔案
                    </span>
                    <i className="bi bi-chevron-down"></i>
                  </a>
                  <ul className="list-group list-group-flush ps-3 collapse" id="userInfo">
                    <li className="list-group-item bg-transparent text-light">
                      用戶：{user?.username || "未提供"}
                    </li>
                  </ul>
                </li>

                {/* 活動結果通知 */}
                <li className="list-group-item bg-transparent">
                  <a className="text-light text-decoration-none d-flex justify-content-between align-items-center"
                    data-bs-toggle="collapse" href="#activeInfo" role="button" aria-expanded="false" aria-controls="activeInfo">
                    <span className="d-flex align-items-center">
                      <i className="bi bi-bell-fill fs-5 me-2"></i>
                      活動結果通知
                    </span>
                    <i className="bi bi-chevron-down"></i>
                  </a>
                  <Activity />
                </li>
                
                {/* 升級 VIP（顯示待開發） */}
                {SHOW_PLACEHOLDERS && (
                  <ComingSoonSection
                    id="VIPInfo"
                    icon="bi-gem text-info"
                    title="升級 VIP"
                    hint="會員訂閱、金流與對帳流程開發中。"
                  />
                )}

                {/* 幽約簿（顯示待開發） */}
                {SHOW_PLACEHOLDERS && (
                  <ComingSoonSection
                    id="JournalInfo"
                    icon="bi-journal-bookmark-fill text-white"
                    title="幽約簿"
                    hint="任務進度、地點解鎖與成就系統開發中。"
                  />
                )}
                {/* 登出 */}
                <li className="list-group-item bg-transparent">
                  <button className="btn btn-danger w-100" onClick={logout}>登出</button>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
