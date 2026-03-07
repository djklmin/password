'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

export function LoginForm() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [twoFactorCode, setTwoFactorCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [requires2FA, setRequires2FA] = useState(false)
  const { signIn, verify2FA } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (requires2FA) {
      const result = await verify2FA(twoFactorCode)
      setLoading(false)
      if (result.error) {
        setError(result.error)
      } else {
        router.push('/vault')
      }
    } else {
      const result = await signIn(username, password)
      setLoading(false)
      if (result.error) {
        setError(result.error)
      } else if (result.requires2FA) {
        setRequires2FA(true)
      } else {
        router.push('/vault')
      }
    }
  }

  return (
    <div className="bg-surface border border-border rounded-xl p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        {!requires2FA ? (
          <>
            <Input
              type="text"
              label="用户名"
              placeholder="请输入用户名"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              }
            />
            <Input
              type="password"
              label="主密码"
              placeholder="请输入主密码"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              }
            />
          </>
        ) : (
          <Input
            type="text"
            label="两步验证码"
            placeholder="请输入6位验证码"
            value={twoFactorCode}
            onChange={(e) => setTwoFactorCode(e.target.value)}
            required
            maxLength={6}
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            }
          />
        )}

        {error && (
          <div className="p-3 bg-danger/10 border border-danger/20 rounded-lg text-danger text-sm">
            {error}
          </div>
        )}

        <Button type="submit" className="w-full" loading={loading}>
          {requires2FA ? '验证' : '登录'}
        </Button>
      </form>
    </div>
  )
}
