"use client"

export function BeforeLogin() {
    return (
        <>
            {/* <!-- 登入畫面 --> */}
            <div className="container my-5">
                <div className="row justify-content-center">
                    <div className="col-md-5 col-lg-4">
                        <div className="card bg-dark text-light border-danger shadow-lg">
                            <div className="card-header text-center text-danger">
                                會員登入
                            </div>
                            <div className="card-body">
                                <form>
                                    {/* <!-- 帳號 --> */}
                                    <div className="mb-3">
                                        <label htmlFor="account" className="form-label">帳號</label>
                                        <div className="input-group">
                                            <span className="input-group-text bg-secondary text-light">
                                                <i className="bi bi-person-fill"></i>
                                            </span>
                                            <input type="text" id="account" className="form-control bg-transparent text-light" placeholder="輸入帳號" required/>
                                        </div>
                                    </div>
                                    {/* <!-- 密碼 --> */}
                                    <div className="mb-3">
                                        <label htmlFor="password" className="form-label">密碼</label>
                                        <div className="input-group">
                                            <span className="input-group-text bg-secondary text-light">
                                                <i className="bi bi-lock-fill"></i>
                                            </span>
                                            <input type="password" id="password" className="form-control bg-transparent text-light" placeholder="輸入密碼" required/>
                                        </div>
                                    </div>
                                    {/* <!-- 忘記密碼 & 記住我 --> */}
                                    <div className="d-flex justify-content-between align-items-center mb-3">
                                        <div className="form-check">
                                            <input className="form-check-input" type="checkbox" id="rememberMe"/>
                                                <label className="form-check-label text-light" htmlFor="rememberMe">記住我</label>
                                        </div>
                                        <a href="#" className="text-info text-decoration-none small">忘記密碼？</a>
                                    </div>
                                    {/* <!-- 登入按鈕 --> */}
                                    <div className="d-grid">
                                        <button type="submit" className="btn btn-danger">登入</button>
                                    </div>
                                </form>
                            </div>
                            <div className="card-footer text-center">
                                <small className="text-secondary">還沒有帳號？ <a href="/registers" className="text-info">立即註冊</a></small>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}