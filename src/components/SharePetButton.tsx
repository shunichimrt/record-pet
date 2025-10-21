'use client'

import { useState, useEffect } from 'react'
import QRCode from 'qrcode'
import { Link2, X, Sparkles, Target, QrCode, Copy, Download, Lock, Info, Clock, Shield } from 'lucide-react'

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
        className="w-full gradient-accent text-white px-6 py-3 rounded-xl font-semibold shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
      >
        <Link2 className="w-5 h-5" />
        共有リンク作成
      </button>

      {showDialog && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-slide-in">
            <div className="p-8">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#A06CD5] to-[#C084FC] rounded-xl flex items-center justify-center">
                    <Link2 className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-[#A06CD5] to-[#C084FC] bg-clip-text text-transparent">
                    ペット共有
                  </h2>
                </div>
                <button
                  onClick={() => {
                    setShowDialog(false)
                    setQrCodeUrl('')
                    setShareUrl('')
                  }}
                  className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-full transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Generate new token */}
              <div className="mb-6 p-6 bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl border border-purple-100">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                  <h3 className="font-bold text-gray-800">新しいリンクを作成</h3>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    有効期限
                  </label>
                  <select
                    value={expirationDays}
                    onChange={(e) => setExpirationDays(Number(e.target.value))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[#A06CD5] transition-all"
                  >
                    <option value={1}>1日</option>
                    <option value={7}>7日間</option>
                    <option value={30}>30日間</option>
                    <option value={90}>90日間</option>
                  </select>
                </div>
                <button
                  onClick={generateToken}
                  disabled={loading}
                  className="w-full gradient-accent text-white px-6 py-3 rounded-xl font-semibold shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      生成中...
                    </>
                  ) : (
                    <>
                      <Target className="w-5 h-5" />
                      リンクを生成
                    </>
                  )}
                </button>
              </div>

              {/* QR Code and Share URL */}
              {qrCodeUrl && (
                <div className="mb-6 p-6 bg-gradient-to-br from-green-50 to-blue-50 rounded-2xl border border-green-100 animate-fade-in">
                  <div className="flex items-center gap-2 mb-4">
                    <QrCode className="w-5 h-5 text-green-600" />
                    <h3 className="font-bold text-gray-800">QRコード</h3>
                  </div>
                  <div className="bg-white p-4 rounded-xl mb-4 flex justify-center">
                    <img
                      src={qrCodeUrl}
                      alt="QR Code"
                      className="rounded-lg"
                    />
                  </div>
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={shareUrl}
                        readOnly
                        className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-sm bg-white font-mono text-xs"
                      />
                      <button
                        onClick={copyToClipboard}
                        className="px-4 py-3 bg-gray-700 hover:bg-gray-800 text-white rounded-xl font-semibold transition-all flex items-center gap-2"
                      >
                        <Copy className="w-4 h-4" />
                        <span className="hidden sm:inline">コピー</span>
                      </button>
                    </div>
                    <button
                      onClick={downloadQR}
                      className="w-full px-4 py-3 bg-green-600 text-white hover:bg-green-700 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
                    >
                      <Download className="w-5 h-5" />
                      QRコードをダウンロード
                    </button>
                  </div>
                </div>
              )}

              {/* Active tokens list */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Lock className="w-5 h-5 text-gray-700" />
                  <h3 className="font-bold text-gray-800">アクティブなリンク</h3>
                </div>
                {!isAdmin && (
                  <div className="flex items-center gap-2 text-xs text-blue-700 bg-blue-50 p-3 rounded-xl mb-4 border border-blue-100">
                    <Info className="w-4 h-4 flex-shrink-0" />
                    <p>管理者のみリンクを無効化できます</p>
                  </div>
                )}
                {tokens.length > 0 ? (
                  <div className="space-y-3">
                    {tokens.map((token, index) => (
                      <div
                        key={token.id}
                        className="p-4 bg-gradient-to-r from-gray-50 to-white border border-gray-100 rounded-xl hover:shadow-md transition-all"
                        style={{ animationDelay: `${index * 0.1}s` }}
                      >
                        <div className="flex justify-between items-center gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <Link2 className="w-4 h-4 text-gray-600" />
                              <div className="text-xs font-mono text-gray-600 truncate bg-gray-100 px-2 py-1 rounded">
                                {token.token.substring(0, 20)}...
                              </div>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <Clock className="w-3.5 h-3.5" />
                              <span>
                                有効期限: {new Date(token.expires_at).toLocaleDateString('ja-JP')}
                              </span>
                            </div>
                          </div>
                          {isAdmin && (
                            <button
                              onClick={() => revokeToken(token.id)}
                              className="text-xs px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg font-semibold transition-all flex items-center gap-1"
                            >
                              <Shield className="w-4 h-4" />
                              無効化
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    <Lock className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm">アクティブなリンクがありません</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
