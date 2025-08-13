"use client"
import axios from 'axios'
import { useAuth } from "@/hooks/useAuth"
import { Header } from "../../components/header"
import {Activity} from './activity'
export default function AfterLogin() {
  const { user, logout } = useAuth()
 
  
  
  
  return (
    <>
    <Header/>
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
                <Activity/>
              </li>

              {/* 升級VIP */}
              <li className="list-group-item bg-transparent">
                <a className="text-light text-decoration-none d-flex justify-content-between align-items-center"
                  data-bs-toggle="collapse" href="#VIPInfo" role="button" aria-expanded="false" aria-controls="VIPInfo">
                  <span className="d-flex align-items-center">
                    <i className="bi bi-gem fs-5 text-info me-2"></i>
                    升級VIP
                  </span>
                  <i className="bi bi-chevron-down"></i>
                </a>
                <ul className="list-group list-group-flush ps-3 collapse" id="VIPInfo">
                  <li className="list-group-item bg-transparent text-light">
                    <button className="btn btn-light">點擊購買</button>
                  </li>
                </ul>
              </li>

              {/* 幽約簿 */}
              <li className="list-group-item bg-transparent">
                <a className="text-light text-decoration-none d-flex justify-content-between align-items-center"
                  data-bs-toggle="collapse" href="#ContactInfo" role="button" aria-expanded="false"
                  aria-controls="ContactInfo">
                  <span className="d-flex align-items-center">
                    <i className="bi bi-journal-bookmark-fill fs-5 text-white me-2"></i>
                    幽約簿
                  </span>
                  <i className="bi bi-chevron-down"></i>
                </a>
                <ul className="list-group list-group-flush ps-3 collapse" id="ContactInfo">
                  <li className="list-group-item bg-transparent text-light">
                    幽約進度:16/32
                  </li>
                  <li className="list-group-item bg-transparent text-light">
                    <div className="progress" role="progressbar" aria-label="Animated striped example" aria-valuenow="50"
                      aria-valuemin="0" aria-valuemax="100">
                      <div className="progress-bar progress-bar-striped progress-bar-animated" style={{ width: "50%" }}></div>
                    </div>
                  </li>
                </ul>
              </li>

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
