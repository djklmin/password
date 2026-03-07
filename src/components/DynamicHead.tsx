'use client'

import { useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'

export function DynamicHead() {
  const { user } = useAuth()

  useEffect(() => {
    const title = user?.siteTitle || 'SecureVault密码管理器'
    const icon = user?.siteIcon || 'https://djkl.qzz.io/file/1770081419896_头像.webp'
    
    document.title = title
    
    let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement
    if (!link) {
      link = document.createElement('link')
      link.rel = 'icon'
      document.head.appendChild(link)
    }
    link.href = icon
  }, [user?.siteTitle, user?.siteIcon])

  return null
}
