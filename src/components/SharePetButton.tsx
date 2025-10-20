'use client'

import { useState, useEffect } from 'react'
import QRCode from 'qrcode'

interface ShareToken {
  id: string
  token: string
  expires_at: string
}

export default function SharePetButton({
  petId,
  isAdmin,
}: {
  petId: string
  isAdmin: boolean
}) {
  const [loading, setLoading] = useState(false)
  const [showDialog, setShowDialog] = useState(false)
  const [tokens, setTokens] = useState<ShareToken[]>([])
  const [qrCodeUrl, setQrCodeUrl] = useState('')
  const [shareUrl, setShareUrl] = useState('')
  const [expirationDays, setExpirationDays] = useState(7)

  useEffect(() => {
    if (showDialog) {
      loadTokens()
    }
  }, [showDialog])

  const loadTokens = async () => {
    try {
      const response = await fetch(`/api/pets/${petId}/share`)
      if (response.ok) {
        const data = await response.json()
        setTokens(data.tokens || [])
      }
    } catch (error) {
      console.error('Failed to load tokens:', error)
    }
  }

  const generateToken = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/pets/${petId}/share`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ expirationDays }),
      })

      if (!response.ok) throw new Error('Failed to generate token')

      const data = await response.json()
      const url = `${window.location.origin}/share/${data.token}`
      setShareUrl(url)

      // Generate QR code
      const qrUrl = await QRCode.toDataURL(url, {
        width: 300,
        margin: 2,
      })
      setQrCodeUrl(qrUrl)

      loadTokens()
    } catch (error) {
      alert('Failed to generate share link')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const revokeToken = async (tokenId: string) => {
    if (!confirm('Are you sure you want to revoke this share link?')) return

    try {
      const response = await fetch(
        `/api/pets/${petId}/share?tokenId=${tokenId}`,
        { method: 'DELETE' }
      )

      if (!response.ok) {
        const errorData = await response.json()
        console.error('Revoke error:', response.status, errorData)
        throw new Error(errorData.error || 'Failed to revoke token')
      }

      loadTokens()
      setQrCodeUrl('')
      setShareUrl('')
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to revoke share link'
      alert(`エラー: ${errorMessage}`)
      console.error('Full revoke error:', error)
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl)
    alert('Link copied to clipboard!')
  }

  const downloadQR = () => {
    const link = document.createElement('a')
    link.href = qrCodeUrl
    link.download = `pet-${petId}-qr.png`
    link.click()
  }

  return (
    <>
      <button
        onClick={() => setShowDialog(true)}
        className="w-full bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 text-sm"
      >
        🔗 Share
      </button>

      {showDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Share Pet</h2>
                <button
                  onClick={() => {
                    setShowDialog(false)
                    setQrCodeUrl('')
                    setShareUrl('')
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              {/* Generate new token */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold mb-3">Generate New Share Link</h3>
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Expires in (days)
                  </label>
                  <select
                    value={expirationDays}
                    onChange={(e) => setExpirationDays(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value={1}>1 day</option>
                    <option value={7}>7 days</option>
                    <option value={30}>30 days</option>
                    <option value={90}>90 days</option>
                  </select>
                </div>
                <button
                  onClick={generateToken}
                  disabled={loading}
                  className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Generating...' : 'Generate Link'}
                </button>
              </div>

              {/* QR Code and Share URL */}
              {qrCodeUrl && (
                <div className="mb-6 p-4 border rounded-lg">
                  <div className="text-center mb-3">
                    <img
                      src={qrCodeUrl}
                      alt="QR Code"
                      className="mx-auto border p-2"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={shareUrl}
                        readOnly
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm bg-gray-50"
                      />
                      <button
                        onClick={copyToClipboard}
                        className="px-3 py-2 bg-gray-200 hover:bg-gray-300 rounded text-sm"
                      >
                        Copy
                      </button>
                    </div>
                    <button
                      onClick={downloadQR}
                      className="w-full px-3 py-2 bg-green-600 text-white hover:bg-green-700 rounded text-sm"
                    >
                      Download QR Code
                    </button>
                  </div>
                </div>
              )}

              {/* Active tokens list */}
              <div>
                <h3 className="font-semibold mb-3">Active Share Links</h3>
                {!isAdmin && (
                  <p className="text-xs text-blue-600 bg-blue-50 p-2 rounded mb-3">
                    Only admins can revoke share links
                  </p>
                )}
                {tokens.length > 0 ? (
                  <div className="space-y-2">
                    {tokens.map((token) => (
                      <div
                        key={token.id}
                        className="p-3 border rounded-lg flex justify-between items-center"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-mono text-gray-600 truncate">
                            {token.token.substring(0, 16)}...
                          </div>
                          <div className="text-xs text-gray-500">
                            Expires:{' '}
                            {new Date(token.expires_at).toLocaleDateString()}
                          </div>
                        </div>
                        {isAdmin && (
                          <button
                            onClick={() => revokeToken(token.id)}
                            className="ml-2 text-xs px-3 py-1 bg-red-100 text-red-600 hover:bg-red-200 rounded"
                          >
                            Revoke
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 text-center py-4">
                    No active share links
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
