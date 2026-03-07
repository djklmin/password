'use client'

import { useState } from 'react'
import { LoginForm } from '@/components/auth/LoginForm'
import { RegisterForm } from '@/components/auth/RegisterForm'

function LandingContent() {
  const [isLogin, setIsLogin] = useState(true)

  return (
    <div className="min-h-screen bg-background flex">
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-2xl mb-4">
              <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-text mb-2">SecureVault</h1>
            <p className="text-textMuted">End-to-end encrypted password manager</p>
          </div>

          <div className="bg-surface border border-border rounded-xl p-6">
            <div className="flex mb-6">
              <button
                onClick={() => setIsLogin(true)}
                className={`flex-1 py-2 text-sm font-medium transition-colors ${
                  isLogin
                    ? 'text-primary border-b-2 border-primary'
                    : 'text-textMuted hover:text-text'
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => setIsLogin(false)}
                className={`flex-1 py-2 text-sm font-medium transition-colors ${
                  !isLogin
                    ? 'text-primary border-b-2 border-primary'
                    : 'text-textMuted hover:text-text'
                }`}
              >
                Create Account
              </button>
            </div>

            {isLogin ? <LoginForm /> : <RegisterForm />}
          </div>

          <p className="text-center text-xs text-textMuted mt-6">
            Your data is encrypted locally. We never have access to your master password.
          </p>
        </div>
      </div>

      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-primary/20 to-primaryLight/10 items-center justify-center p-8">
        <div className="max-w-lg">
          <h2 className="text-4xl font-bold text-text mb-6">
            Secure your digital life
          </h2>
          <div className="space-y-4">
            {[
              { icon: '🔐', title: 'End-to-End Encryption', desc: 'Your data is encrypted before it leaves your device' },
              { icon: '🔑', title: 'Zero-Knowledge', desc: 'We never see your master password or decrypted data' },
              { icon: '📱', title: 'Cross-Platform', desc: 'Access your vault from any device, anywhere' },
              { icon: '🛡️', title: 'Two-Factor Auth', desc: 'Add an extra layer of security to your account' },
            ].map((feature, i) => (
              <div key={i} className="flex items-start gap-4 bg-surface/50 rounded-lg p-4">
                <span className="text-2xl">{feature.icon}</span>
                <div>
                  <h3 className="font-medium text-text">{feature.title}</h3>
                  <p className="text-sm text-textMuted">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Home() {
  return <LandingContent />
}
