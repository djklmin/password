'use client'

import { useState } from 'react'
import { useVault, VaultItemType, LoginData, SecureNoteData, CardData, IdentityData } from '@/contexts/VaultContext'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { generateRandomPassword, calculatePasswordStrength } from '@/lib/crypto'

interface AddItemModalProps {
  isOpen: boolean
  onClose: () => void
}

export function AddItemModal({ isOpen, onClose }: AddItemModalProps) {
  const { addItem, folders } = useVault()
  const [type, setType] = useState<VaultItemType>('login')
  const [name, setName] = useState('')
  const [folderId, setFolderId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  
  const [loginData, setLoginData] = useState<LoginData>({
    username: '',
    password: '',
    url: '',
    notes: '',
  })
  
  const [noteData, setNoteData] = useState<SecureNoteData>({
    content: '',
  })
  
  const [cardData, setCardData] = useState<CardData>({
    cardholderName: '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    notes: '',
  })
  
  const [identityData, setIdentityData] = useState<IdentityData>({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    notes: '',
  })

  const [passwordOptions, setPasswordOptions] = useState({
    length: 16,
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: true,
  })

  const handleGeneratePassword = () => {
    const password = generateRandomPassword(passwordOptions.length, passwordOptions)
    setLoginData({ ...loginData, password })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    let data: LoginData | SecureNoteData | CardData | IdentityData
    switch (type) {
      case 'login':
        data = loginData
        break
      case 'secure_note':
        data = noteData
        break
      case 'card':
        data = cardData
        break
      case 'identity':
        data = identityData
        break
    }

    const result = await addItem({
      type,
      name,
      data,
      folderId,
      favorite: false,
    })

    setLoading(false)

    if (!result.error) {
      onClose()
      resetForm()
    }
  }

  const resetForm = () => {
    setType('login')
    setName('')
    setFolderId(null)
    setLoginData({ username: '', password: '', url: '', notes: '' })
    setNoteData({ content: '' })
    setCardData({ cardholderName: '', cardNumber: '', expiryDate: '', cvv: '', notes: '' })
    setIdentityData({ fullName: '', email: '', phone: '', address: '', notes: '' })
  }

  const typeOptions = [
    { value: 'login', label: 'Login', icon: '🔑' },
    { value: 'secure_note', label: 'Secure Note', icon: '📝' },
    { value: 'card', label: 'Card', icon: '💳' },
    { value: 'identity', label: 'Identity', icon: '👤' },
  ]

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add New Item" size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-textMuted mb-2">Type</label>
          <div className="grid grid-cols-4 gap-2">
            {typeOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setType(option.value as VaultItemType)}
                className={`p-3 rounded-lg border text-center transition-colors ${
                  type === option.value
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border hover:border-primaryLight text-textMuted'
                }`}
              >
                <span className="text-xl">{option.icon}</span>
                <span className="block text-xs mt-1">{option.label}</span>
              </button>
            ))}
          </div>
        </div>

        <Input
          label="Name"
          placeholder="Item name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        {folders.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-textMuted mb-1.5">Folder</label>
            <select
              value={folderId || ''}
              onChange={(e) => setFolderId(e.target.value || null)}
              className="w-full bg-surface border border-border rounded-lg px-4 py-2.5 text-text"
            >
              <option value="">No folder</option>
              {folders.map((folder) => (
                <option key={folder.id} value={folder.id}>
                  {folder.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {type === 'login' && (
          <>
            <Input
              label="Username"
              placeholder="Username or email"
              value={loginData.username}
              onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
            />
            <div>
              <label className="block text-sm font-medium text-textMuted mb-1.5">Password</label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Password"
                    value={loginData.password}
                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                    className="w-full bg-surface border border-border rounded-lg px-4 py-2.5 text-text pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-textMuted hover:text-text"
                  >
                    {showPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
                <Button type="button" variant="secondary" onClick={handleGeneratePassword}>
                  Generate
                </Button>
              </div>
              {loginData.password && (
                <div className="mt-2">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1 bg-surface rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all ${
                          calculatePasswordStrength(loginData.password).score <= 2
                            ? 'bg-danger'
                            : calculatePasswordStrength(loginData.password).score <= 4
                            ? 'bg-warning'
                            : calculatePasswordStrength(loginData.password).score <= 5
                            ? 'bg-primaryLight'
                            : 'bg-success'
                        }`}
                        style={{ width: `${(calculatePasswordStrength(loginData.password).score / 7) * 100}%` }}
                      />
                    </div>
                    <span className={`text-xs ${calculatePasswordStrength(loginData.password).color}`}>
                      {calculatePasswordStrength(loginData.password).label}
                    </span>
                  </div>
                </div>
              )}
            </div>
            <Input
              label="URL"
              placeholder="https://example.com"
              value={loginData.url}
              onChange={(e) => setLoginData({ ...loginData, url: e.target.value })}
            />
            <div>
              <label className="block text-sm font-medium text-textMuted mb-1.5">Notes</label>
              <textarea
                placeholder="Additional notes"
                value={loginData.notes}
                onChange={(e) => setLoginData({ ...loginData, notes: e.target.value })}
                className="w-full bg-surface border border-border rounded-lg px-4 py-2.5 text-text min-h-[80px] resize-none"
              />
            </div>
          </>
        )}

        {type === 'secure_note' && (
          <div>
            <label className="block text-sm font-medium text-textMuted mb-1.5">Content</label>
            <textarea
              placeholder="Write your secure note here..."
              value={noteData.content}
              onChange={(e) => setNoteData({ ...noteData, content: e.target.value })}
              className="w-full bg-surface border border-border rounded-lg px-4 py-2.5 text-text min-h-[200px] resize-none"
              required
            />
          </div>
        )}

        {type === 'card' && (
          <>
            <Input
              label="Cardholder Name"
              placeholder="John Doe"
              value={cardData.cardholderName}
              onChange={(e) => setCardData({ ...cardData, cardholderName: e.target.value })}
            />
            <Input
              label="Card Number"
              placeholder="1234 5678 9012 3456"
              value={cardData.cardNumber}
              onChange={(e) => setCardData({ ...cardData, cardNumber: e.target.value })}
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Expiry Date"
                placeholder="MM/YY"
                value={cardData.expiryDate}
                onChange={(e) => setCardData({ ...cardData, expiryDate: e.target.value })}
              />
              <Input
                label="CVV"
                placeholder="123"
                type="password"
                value={cardData.cvv}
                onChange={(e) => setCardData({ ...cardData, cvv: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-textMuted mb-1.5">Notes</label>
              <textarea
                placeholder="Additional notes"
                value={cardData.notes}
                onChange={(e) => setCardData({ ...cardData, notes: e.target.value })}
                className="w-full bg-surface border border-border rounded-lg px-4 py-2.5 text-text min-h-[80px] resize-none"
              />
            </div>
          </>
        )}

        {type === 'identity' && (
          <>
            <Input
              label="Full Name"
              placeholder="John Doe"
              value={identityData.fullName}
              onChange={(e) => setIdentityData({ ...identityData, fullName: e.target.value })}
            />
            <Input
              label="Email"
              type="email"
              placeholder="john@example.com"
              value={identityData.email}
              onChange={(e) => setIdentityData({ ...identityData, email: e.target.value })}
            />
            <Input
              label="Phone"
              placeholder="+1 234 567 8900"
              value={identityData.phone}
              onChange={(e) => setIdentityData({ ...identityData, phone: e.target.value })}
            />
            <div>
              <label className="block text-sm font-medium text-textMuted mb-1.5">Address</label>
              <textarea
                placeholder="Full address"
                value={identityData.address}
                onChange={(e) => setIdentityData({ ...identityData, address: e.target.value })}
                className="w-full bg-surface border border-border rounded-lg px-4 py-2.5 text-text min-h-[80px] resize-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-textMuted mb-1.5">Notes</label>
              <textarea
                placeholder="Additional notes"
                value={identityData.notes}
                onChange={(e) => setIdentityData({ ...identityData, notes: e.target.value })}
                className="w-full bg-surface border border-border rounded-lg px-4 py-2.5 text-text min-h-[80px] resize-none"
              />
            </div>
          </>
        )}

        <div className="flex gap-3 pt-4">
          <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button type="submit" className="flex-1" loading={loading}>
            Add Item
          </Button>
        </div>
      </form>
    </Modal>
  )
}
