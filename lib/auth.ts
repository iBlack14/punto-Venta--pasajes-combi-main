import { supabase } from "@/lib/supabase/client"

export interface User {
  id: string
  name: string
  email: string
  role: "admin" | "operator" | "viewer"
  permissions: {
    read: boolean
    write: boolean
    delete: boolean
    config: boolean
    reports: boolean
  }
  avatar?: string
}

export interface AuthState {
  isAuthenticated: boolean
  user: User | null
  isLoading: boolean
}

// Session timeout in milliseconds (10 minutes)
export const SESSION_TIMEOUT = 10 * 60 * 1000

let sessionTimeout: NodeJS.Timeout | null = null
let logoutCallback: (() => void) | null = null

export const setLogoutCallback = (callback: () => void) => {
  logoutCallback = callback
}

export const resetSessionTimeout = () => {
  if (sessionTimeout) {
    clearTimeout(sessionTimeout)
  }

  sessionTimeout = setTimeout(() => {
    if (logoutCallback) {
      logoutCallback()
    }
  }, SESSION_TIMEOUT)
}

export const clearSessionTimeout = () => {
  if (sessionTimeout) {
    clearTimeout(sessionTimeout)
    sessionTimeout = null
  }
}

export const authenticateUser = async (email: string, password: string): Promise<User> => {
  try {
    const { data, error } = await supabase.rpc('verify_user_login', {
      input_email: email,
      input_password: password
    })

    if (error) {
      throw new Error('Error de conexión con la base de datos')
    }

    if (!data || data.length === 0) {
      throw new Error('Email o contraseña incorrectos')
    }

    const userData = data[0]

    const user: User = {
      id: userData.user_id,
      name: userData.user_name,
      email: userData.user_email,
      role: userData.user_role,
      permissions: userData.user_permissions,
      avatar: "/placeholder-user.jpg"
    }

    // Start session timeout
    resetSessionTimeout()

    return user
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Error de autenticación')
  }
}

export const logout = () => {
  // Clear session timeout
  clearSessionTimeout()

  // Clear localStorage (only in browser)
  if (typeof window !== 'undefined') {
    localStorage.removeItem("auth_token")
    localStorage.removeItem("user_data")
    localStorage.removeItem("last_activity")
  }
}

export const saveAuthData = (user: User) => {
  if (typeof window === 'undefined') return

  const timestamp = Date.now()
  localStorage.setItem("auth_token", "session_" + user.id + "_" + timestamp)
  localStorage.setItem("user_data", JSON.stringify(user))
  localStorage.setItem("last_activity", timestamp.toString())

  // Start session timeout
  resetSessionTimeout()
}

export const loadAuthData = (): User | null => {
  try {
    // Check if we're in browser environment
    if (typeof window === 'undefined') return null

    const token = localStorage.getItem("auth_token")
    const userData = localStorage.getItem("user_data")
    const lastActivity = localStorage.getItem("last_activity")

    if (!token || !userData || !lastActivity) return null

    // Check if session has expired
    const timeSinceLastActivity = Date.now() - parseInt(lastActivity)
    if (timeSinceLastActivity > SESSION_TIMEOUT) {
      logout()
      return null
    }

    const user = JSON.parse(userData)

    // Don't start timeout here - it will be started after callback is set

    return user
  } catch {
    return null
  }
}

export const updateLastActivity = () => {
  if (typeof window === 'undefined') return

  const userData = localStorage.getItem("user_data")
  if (userData) {
    localStorage.setItem("last_activity", Date.now().toString())
    resetSessionTimeout()
  }
}

export const hasPermission = (user: User | null, action: string): boolean => {
  if (!user || !user.permissions) return false

  return user.permissions[action as keyof typeof user.permissions] || false
}
