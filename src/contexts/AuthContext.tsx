'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { supabase } from '@/lib/supabase'
import { v4 as uuidv4 } from 'uuid'
import {
  generateSalt,
  deriveKey,
  generateMasterKey,
  encryptMasterKey,
  decryptMasterKey,
  hashPassword,
} from '@/lib/crypto'
import { verifyTOTP } from '@/lib/totp'

interface User {
  id: string
  email: string
  twoFactorEnabled: boolean
}

interface PendingUser extends User {
  masterKey: string
  twoFactorSecret: string | null
}

interface AuthContextType {
  user: User | null
  loading: boolean
  masterKey: string | null
  signUp: (email: string, password: string) => Promise<{ error: string | null }>
  signIn: (email: string, password: string) => Promise<{ requires2FA: boolean; error: string | null }>
  verify2FA: (code: string) => Promise<{ error: string | null }>
  signOut: () => void
  unlockVault: (password: string) => Promise<{ error: string | null }>
  lockVault: () => void
  isVaultUnlocked: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [masterKey, setMasterKey] = useState<string | null>(null)
  const [pendingUser, setPendingUser] = useState<PendingUser | null>(null)

  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
    setLoading(false)
  }, [])

  const signUp = async (email: string, password: string) => {
    try {
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .single()

      if (existingUser) {
        return { error: 'Email already registered' }
      }

      const salt = generateSalt()
      const derivedKey = deriveKey(password, salt)
      const masterKey = generateMasterKey()
      const encryptedMasterKey = encryptMasterKey(masterKey, derivedKey)
      const passwordHash = hashPassword(password)

      const userId = uuidv4()
      const { error } = await supabase.from('users').insert({
        id: userId,
        email,
        encrypted_master_key: encryptedMasterKey,
        salt,
        two_factor_enabled: false,
        two_factor_secret: null,
      })

      if (error) {
        return { error: error.message }
      }

      const newUser = { id: userId, email, twoFactorEnabled: false }
      setUser(newUser)
      setMasterKey(masterKey)
      localStorage.setItem('user', JSON.stringify(newUser))
      localStorage.setItem('masterKey', masterKey)

      return { error: null }
    } catch (err) {
      return { error: 'An error occurred during registration' }
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      const { data: userData, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single()

      if (error || !userData) {
        return { requires2FA: false, error: 'Invalid email or password' }
      }

      const derivedKey = deriveKey(password, userData.salt)
      
      try {
        const decryptedMasterKey = decryptMasterKey(userData.encrypted_master_key, derivedKey)
        
        const pendingUserData = {
          id: userData.id,
          email: userData.email,
          twoFactorEnabled: userData.two_factor_enabled,
          masterKey: decryptedMasterKey,
          twoFactorSecret: userData.two_factor_secret,
        }

        if (userData.two_factor_enabled) {
          setPendingUser(pendingUserData)
          return { requires2FA: true, error: null }
        }

        const newUser = { id: userData.id, email: userData.email, twoFactorEnabled: false }
        setUser(newUser)
        setMasterKey(decryptedMasterKey)
        localStorage.setItem('user', JSON.stringify(newUser))
        localStorage.setItem('masterKey', decryptedMasterKey)

        return { requires2FA: false, error: null }
      } catch {
        return { requires2FA: false, error: 'Invalid email or password' }
      }
    } catch (err) {
      return { requires2FA: false, error: 'An error occurred during sign in' }
    }
  }

  const verify2FA = async (code: string) => {
    if (!pendingUser || !pendingUser.twoFactorSecret) {
      return { error: 'No pending 2FA verification' }
    }

    const isValid = verifyTOTP(pendingUser.twoFactorSecret, code)
    if (!isValid) {
      return { error: 'Invalid verification code' }
    }

    const newUser = {
      id: pendingUser.id,
      email: pendingUser.email,
      twoFactorEnabled: pendingUser.twoFactorEnabled,
    }
    setUser(newUser)
    setMasterKey(pendingUser.masterKey)
    localStorage.setItem('user', JSON.stringify(newUser))
    localStorage.setItem('masterKey', pendingUser.masterKey)
    setPendingUser(null)

    return { error: null }
  }

  const signOut = () => {
    setUser(null)
    setMasterKey(null)
    localStorage.removeItem('user')
    localStorage.removeItem('masterKey')
  }

  const unlockVault = async (password: string) => {
    if (!user) {
      return { error: 'Not authenticated' }
    }

    try {
      const { data: userData, error } = await supabase
        .from('users')
        .select('salt, encrypted_master_key')
        .eq('id', user.id)
        .single()

      if (error || !userData) {
        return { error: 'Failed to unlock vault' }
      }

      const derivedKey = deriveKey(password, userData.salt)
      const decryptedMasterKey = decryptMasterKey(userData.encrypted_master_key, derivedKey)
      
      setMasterKey(decryptedMasterKey)
      localStorage.setItem('masterKey', decryptedMasterKey)

      return { error: null }
    } catch {
      return { error: 'Invalid password' }
    }
  }

  const lockVault = () => {
    setMasterKey(null)
    localStorage.removeItem('masterKey')
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        masterKey,
        signUp,
        signIn,
        verify2FA,
        signOut,
        unlockVault,
        lockVault,
        isVaultUnlocked: !!masterKey,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
