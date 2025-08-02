"use client"
import Image from 'next/image'
export function Navbar() {
    return (
        <nav className="navbar navbar-expand-lg">
            <div className="container">
                <a className="navbar-brand" href="#">Ghost Move</a>
                <button className="navbar-toggler bg-light" type="button" data-bs-toggle="collapse" data-bs-target="#navMenu">
                    <span className="navbar-toggler-icon"></span>
                </button>

                <div className="collapse navbar-collapse" id="navMenu">
                    <ul className="navbar-nav ms-auto">
                        <li className="nav-item"><a className="nav-link" href="/">地圖</a></li>
                        <li className="nav-item"><a className="nav-link" href="/tasks">活動</a></li>
                        <li className="nav-item"><a className="nav-link" href="/accounts">個人頁面</a></li>
                    </ul>

                    <ul className="navbar-nav">
                        <li className="nav-item dropdown">
                            <a className="nav-link dropdown-toggle p-0" href="#" id="userDropdown" role="button" data-bs-toggle="dropdown"
                                aria-expanded="false">
                                {/*  <img src="your-avatar.jpg" alt="Avatar" className="rounded-circle" width="32" height="32">  */}
                                <img src="/img/user.png" alt="User" style={{filter: "invert(1)", width:"32px",height:"32px"}}/>
                            </a>
                            <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="userDropdown">
                                <li><a className="dropdown-item" href="#">會員</a></li>
                                <li><a className="dropdown-item" href="#">等級</a></li>
                                <li><a className="dropdown-item" href="#">姓名</a></li>
                                <li>
                                    <hr className="dropdown-divider" />
                                </li>
                                <li><a className="dropdown-item" href="#">登出</a></li>
                            </ul>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    )
}