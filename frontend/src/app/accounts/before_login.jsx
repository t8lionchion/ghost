"use client"

import { useState } from "react"
import { useAuth } from "@/hooks/useAuth"

export function BeforeLogin() {
  const { login, loading, error } = useAuth()
  const [account, setAccount] = useState("")
  const [password, setPassword] = useState("")

  const handleSubmit = async (e) => {
    e.preventDefault()
    await login({ account, password })
  }

  return (
    <div className="container my-5">
      <div className="row justify-content-center">
        <div className="col-md-5 col-lg-4">
          <div className="card bg-dark text-light border-danger shadow-lg">
            <div className="card-header text-center text-danger">會員登入</div>
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                {/* 帳號 */}
                <div className="mb-3">
                  <label htmlFor="account" className="form-label">帳號</label>
                  <div className="input-group">
                    <span className="input-group-text bg-secondary text-light">
                      <i className="bi bi-person-badge"></i>
                    </span>
                    <input
                      type="text"
                      id="account"
                      className="form-control bg-transparent text-light"
                      placeholder="輸入帳號"
                      required
                      value={account}
                      onChange={(e) => setAccount(e.target.value)}
                    />
                  </div>
                </div>

                {/* 密碼 */}
                <div className="mb-3">
                  <label htmlFor="password" className="form-label">密碼</label>
                  <div className="input-group">
                    <span className="input-group-text bg-secondary text-light">
                      <i className="bi bi-lock-fill"></i>
                    </span>
                    <input
                      type="password"
                      id="password"
                      className="form-control bg-transparent text-light"
                      placeholder="輸入密碼"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                </div>

                {/* 錯誤訊息 */}
                {error && <div className="text-danger small mb-2">{error}</div>}

                {/* 登入按鈕 */}
                <div className="d-grid">
                  <button type="submit" className="btn btn-danger" disabled={loading}>
                    {loading ? "登入中..." : "登入"}
                  </button>
                </div>
              </form>
            </div>
            <div className="card-footer text-center">
              <small className="text-secondary">
                還沒有帳號？ <a href="/registers" className="text-info">立即註冊</a>
              </small>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
