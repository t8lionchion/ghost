"use client"
export function Register() {
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
                    <input type="text" id="name" className="form-control bg-transparent text-light" placeholder="輸入您的姓名" required />
                  </div>
                </div>
                {/* 電子郵件  */}
                <div className="mb-3">
                  <label htmlFor="email" className="form-label">電子郵件</label>
                  <div className="input-group">
                    <span className="input-group-text bg-secondary text-light">
                      <i className="bi bi-envelope-fill"></i>
                    </span>
                    <input type="email" id="email" className="form-control bg-transparent text-light" placeholder="example@mail.com" required />
                  </div>
                </div>
                {/*  帳號  */}
                <div className="mb-3">
                  <label htmlFor="account" className="form-label">帳號</label>
                  <div className="input-group">
                    <span className="input-group-text bg-secondary text-light">
                      <i className="bi bi-person-badge-fill"></i>
                    </span>
                    <input type="text" id="account" className="form-control bg-transparent text-light" placeholder="設定登入帳號" required />
                  </div>
                </div>
                {/* 密碼  */}
                <div className="mb-3">
                  <label htmlFor="password" className="form-label">密碼</label>
                  <div className="input-group">
                    <span className="input-group-text bg-secondary text-light">
                      <i className="bi bi-lock-fill"></i>
                    </span>
                    <input type="password" id="password" className="form-control bg-transparent text-light" placeholder="設定密碼" required />
                  </div>
                </div>
                {/*  確認密碼  */}
                <div className="mb-3">
                  <label htmlFor="passwordConfirm" className="form-label">確認密碼</label>
                  <div className="input-group">
                    <span className="input-group-text bg-secondary text-light">
                      <i className="bi bi-lock-fill"></i>
                    </span>
                    <input type="password" id="passwordConfirm" className="form-control bg-transparent text-light" placeholder="再次輸入密碼" required />
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
                  <button type="submit" className="btn btn-danger">立即註冊</button>
                </div>
              </form>
            </div>
            <div className="card-footer text-center">
              <small className="text-secondary">
                已經有帳號？
                <a href="#" className="text-info">前往登入</a>
              </small>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}