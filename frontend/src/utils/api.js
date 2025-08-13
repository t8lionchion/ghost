// src/utils/api.js
import axios from 'axios'

let logoutHandler = null

// 提供 context 注入 logout 方法的介面
export function setLogoutHandler(fn) {
  logoutHandler = fn
}

const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/api',
  timeout: 10000,
})

// --- Request 攔截器：自動加 Authorization Header ---
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('accessToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
  }
  return config
})

// --- Response 攔截器：處理 Token 過期 ---
let isRefreshing = false
let failedQueue = []

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })
  failedQueue = []
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // 如果 Access Token 過期（401）
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        }).then((token) => {
          originalRequest.headers.Authorization = 'Bearer ' + token
          return api(originalRequest)
        })
      }

      originalRequest._retry = true
      isRefreshing = true

      const refresh = localStorage.getItem('refreshToken')
      if (!refresh) {
        if (logoutHandler) logoutHandler()
        return Promise.reject(error)
      }

      try {
        const res = await axios.post('http://127.0.0.1:8000/api/token/refresh/', { refresh })
        const newAccessToken = res.data.access
        localStorage.setItem('accessToken', newAccessToken)
        api.defaults.headers.common.Authorization = 'Bearer ' + newAccessToken
        processQueue(null, newAccessToken)
        originalRequest.headers.Authorization = 'Bearer ' + newAccessToken
        return api(originalRequest)
      } catch (err) {
        processQueue(err, null)
        if (logoutHandler) logoutHandler()
        return Promise.reject(err)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)

export default api

export async function getAllActivity() {
  try {
    const response = await api.get('/GetAllActivityView/');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch activity list:', error);
    throw error;
  }
}

export async function getActivityById(id) {
  const response = await api.get(`/GetActivity_form/${id}/`)
  return response.data
}
