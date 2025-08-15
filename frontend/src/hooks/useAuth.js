'use client'
import { useState, useEffect, useCallback, createContext, useContext, useRef } from 'react'
import { useRouter } from 'next/navigation'
import api, { setLogoutHandler } from '@/utils/api'
import axios from 'axios'
import { jwtDecode } from 'jwt-decode' 


const rawApi = axios.create({ baseURL: 'http://127.0.0.1:8000/api' })
const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const auth = useProvideAuth()
  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}

function useProvideAuth() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const refreshTimeoutId = useRef(null)

  const isAuthenticated = Boolean(user)

  // 主動取消定時
  const clearRefreshTimeout = () => {
    if (refreshTimeoutId.current) {
      clearTimeout(refreshTimeoutId.current)
    }
  }

  // 設定下一次主動刷新時間
  const scheduleRefresh = (expiresInSeconds) => {
    clearRefreshTimeout()
    // 提前1分鐘刷新，避免過期
    const refreshTime = (expiresInSeconds - 60) * 1000
    if (refreshTime > 0) {
      refreshTimeoutId.current = setTimeout(() => {
        refreshToken()
      }, refreshTime)
    }
  }

  // 登入
  const login = useCallback(async ({ account, password }) => {
    setLoading(true)
    setError(null)
    try {
      const res = await api.post('/login/', { account, password })
      const { access, refresh } = res.data
      localStorage.setItem('accessToken', access)
      localStorage.setItem('refreshToken', refresh)

      const decoded = jwtDecode(access)
      setUser({ username: decoded.username, role: decoded.role })

      // 計算剩餘過期秒數，JWT exp 是秒數（Unix Timestamp）
      const expiresIn = decoded.exp - Math.floor(Date.now() / 1000)
      scheduleRefresh(expiresIn)

      setLoading(false)
      router.push('/afterlogin')
      return { success: true }
    } catch (e) {
      let message = '登入失敗，請確認帳號密碼'
      if(e.response&&e.response.data.account.includes('此帳號已停用'))
        message="帳號已遭停用，請聯繫管理員"
      setError(message)
      setUser(null)
      setLoading(false)
      return { success: false, error: message}
    }
  }, [])

  // 登出
  const logout = useCallback(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      alert("您未登入");
      e.preventDefault(); // 阻止跳轉
    }
  
    clearRefreshTimeout()
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    setUser(null)
    alert("即將登出")
    router.push('/accounts')
  }, [router])

  // 手動刷新 token
  const refreshToken = useCallback(async () => {
    try {
      const refresh = localStorage.getItem('refreshToken')
      if (!refresh) throw new Error('沒有 refresh token')
      const res = await rawApi.post('/token/refresh/', { refresh })
      const newAccessToken = res.data.access
      localStorage.setItem('accessToken', newAccessToken)

      const decoded = jwtDecode(newAccessToken)
      setUser({ username: decoded.username, role: decoded.role })

      // 重新排定下一次刷新時間
      const expiresIn = decoded.exp - Math.floor(Date.now() / 1000)
      scheduleRefresh(expiresIn)

      return true
    } catch (err) {
      logout()
      return false
    }
  }, [logout])

  // 初始化（啟動時判斷是否已有登入）
  useEffect(() => {
    setLogoutHandler(logout) // 注入攔截器的 logout handler

    const token = localStorage.getItem('accessToken')
    if (token) {
      try {
        const decoded = jwtDecode(token)
        setUser({ username: decoded.username, role: decoded.role })

        // 計算剩餘時間並設定自動刷新
        const expiresIn = decoded.exp - Math.floor(Date.now() / 1000)
        scheduleRefresh(expiresIn)
      } catch {
        setUser(null)
      }
    } else {
      setUser(null)
    }
    setLoading(false)

    // 組件卸載時清除定時器
    return () => {
      clearRefreshTimeout()
    }
  }, [logout])

  return { user, login, logout, refreshToken, isAuthenticated, loading, error }
}
