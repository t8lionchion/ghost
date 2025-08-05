"use client"
import { useState } from 'react';
import { useRouter } from "next/navigation"
import axios from "axios";

export function Register() {
  const router = useRouter()
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [account, setAccount] = useState("");
  const [password, setPassword] = useState("");
  const [CheckPassword, setCheckPassword] = useState("");
  const handleusername = ((e) => {
    setUsername(e.target.value)
  })
  const handleemail = ((e) => {
    setEmail(e.target.value)
  })
  const handleaccount = ((e) => {
    setAccount(e.target.value)
  })
  const handlepassword = ((e) => {
    setPassword(e.target.value)
  })
  const handlecheckpassword = ((e) => {
    setCheckPassword(e.target.value)
  })
  const handleRegister = async (e) => {
    e.preventDefault()
    if (password !== CheckPassword) {
      alert('兩次密碼不一致！')
      return
    }
    try {
      const res = await axios.post(
        process.env.NEXT_PUBLIC_API_BASE_URL+'/api/register/',
        { username, email, account, password },
        { headers: { 'Content-Type': 'application/json' } }
      )
      if (res.data.username) {
        alert("註冊成功")
        router.push("/accounts")   // 成功後程式化跳轉
      }
    } catch (err) {
      const errors = err.response?.data || {}
      // 如果是帳號重複
      if (errors.account) {
        alert(errors.account)    // 後端傳回「帳號已存在」
      }else if(errors.email){
        alert(errors.email)
      }else {
        alert('註冊失敗：' + (errors.non_field_errors || err.message))
      }
    }
  }

  return (
    /*  <!-- 註冊頁面 --> */
    <div className="container my-5">
      <div className="row justify-content-center">
        <div className="col-md-5 col-lg-4">
          <div className="card bg-dark text-light border-danger shadow-lg">
            <div className="card-header text-center text-danger">
              會員註冊
            </div>
            <div className="card-body">
              <form>
                {/* 姓名  */}
                <div className="mb-3">
                  <label htmlFor="name" className="form-label">姓名</label>
                  <div className="input-group">
                    <span className="input-group-text bg-secondary text-light">
                      <i className="bi bi-person-fill"></i>
                    </span>
                    <input type="text" id="name" className="form-control bg-transparent text-light" placeholder="輸入您的姓名" required value={username} onChange={handleusername} />
                  </div>
                </div>
                {/* 電子郵件  */}
                <div className="mb-3">
                  <label htmlFor="email" className="form-label">電子郵件</label>
                  <div className="input-group">
                    <span className="input-group-text bg-secondary text-light">
                      <i className="bi bi-envelope-fill"></i>
                    </span>
                    <input type="email" id="email" className="form-control bg-transparent text-light" placeholder="example@mail.com" required value={email} onChange={handleemail} />
                  </div>
                </div>
                {/*  帳號  */}
                <div className="mb-3">
                  <label htmlFor="account" className="form-label">帳號</label>
                  <div className="input-group">
                    <span className="input-group-text bg-secondary text-light">
                      <i className="bi bi-person-badge-fill"></i>
                    </span>
                    <input type="text" id="account" className="form-control bg-transparent text-light" placeholder="設定登入帳號" required value={account} onChange={handleaccount} />
                  </div>
                </div>
                {/* 密碼  */}
                <div className="mb-3">
                  <label htmlFor="password" className="form-label">密碼</label>
                  <div className="input-group">
                    <span className="input-group-text bg-secondary text-light">
                      <i className="bi bi-lock-fill"></i>
                    </span>
                    <input type="password" id="password" className="form-control bg-transparent text-light" placeholder="設定密碼" required value={password} onChange={handlepassword} />
                  </div>
                </div>
                {/*  確認密碼  */}
                <div className="mb-3">
                  <label htmlFor="passwordConfirm" className="form-label">確認密碼</label>
                  <div className="input-group">
                    <span className="input-group-text bg-secondary text-light">
                      <i className="bi bi-lock-fill"></i>
                    </span>
                    <input type="password" id="passwordConfirm" className="form-control bg-transparent text-light" placeholder="再次輸入密碼" required value={CheckPassword} onChange={handlecheckpassword} />
                  </div>
                </div>
                {/*  同意條款  */}
                <div className="form-check mb-4">
                  <input className="form-check-input" type="checkbox" id="agreeTerms" required />
                  <label className="form-check-label text-light" htmlFor="agreeTerms">
                    我已閱讀並同意 <a href="#" className="text-info">服務條款</a> 與 <a href="#" className="text-info">隱私權政策</a>
                  </label>
                </div>
                {/* 註冊按鈕 */}
                <div className="d-grid">
                  <button type="submit" className="btn btn-danger" onClick={handleRegister}>立即註冊</button>
                </div>
              </form>
            </div>
            <div className="card-footer text-center">
              <small className="text-secondary">
                已經有帳號？
                <a href="/accounts" className="text-info" >前往登入</a>
              </small>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
