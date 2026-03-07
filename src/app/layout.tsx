import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/contexts/AuthContext'
import { VaultProvider } from '@/contexts/VaultContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'SecureVault - Password Manager',
  description: 'A secure, end-to-end encrypted password manager',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <VaultProvider>
            {children}
          </VaultProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
