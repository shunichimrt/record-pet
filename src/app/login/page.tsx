'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { PawPrint, Dog, Cat, Mail, Lock, Loader2, Sparkles, LogIn } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/callback`,
          },
        })
        if (error) throw error
        alert('Check your email for the confirmation link!')
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) throw error
        router.push('/app')
        router.refresh()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center gradient-secondary relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full opacity-10 text-gray-400">
        <PawPrint className="absolute top-20 left-20 w-36 h-36" />
        <PawPrint className="absolute bottom-20 right-20 w-36 h-36" />
        <Dog className="absolute top-1/2 left-1/3 w-24 h-24" />
        <Cat className="absolute top-1/3 right-1/4 w-24 h-24" />
      </div>

      <div className="max-w-md w-full space-y-8 p-10 glass-effect rounded-2xl shadow-xl relative z-10 m-4 animate-fade-in">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-[#FF8E53] to-[#FF6B6B] rounded-2xl flex items-center justify-center mb-4">
            <PawPrint className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-4xl font-bold bg-gradient-to-r from-[#FF8E53] to-[#FF6B6B] bg-clip-text text-transparent mb-2">
            Record Pet
          </h2>
          <p className="text-gray-600 text-sm">
            {isSignUp ? 'ペットの記録を始めましょう' : 'ペットの記録にアクセス'}
          </p>
        </div>

        <form className="space-y-6" onSubmit={handleAuth}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm animate-slide-in">
              {error}
            </div>
          )}

          <div className="space-y-1">
            <label htmlFor="email" className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Mail className="w-4 h-4" />
              メールアドレス
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="block w-full px-4 py-3 border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-[#FF8E53] focus:border-transparent transition-all"
              placeholder="your@email.com"
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="password" className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Lock className="w-4 h-4" />
              パスワード
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="block w-full px-4 py-3 border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-[#FF8E53] focus:border-transparent transition-all"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center items-center gap-2 py-3 px-4 gradient-primary text-white rounded-xl font-semibold shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                読み込み中...
              </>
            ) : (
              <>
                {isSignUp ? <Sparkles className="w-5 h-5" /> : <LogIn className="w-5 h-5" />}
                {isSignUp ? 'サインアップ' : 'サインイン'}
              </>
            )}
          </button>
        </form>

        <div className="text-center pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-sm font-medium bg-gradient-to-r from-[#FF8E53] to-[#FF6B6B] bg-clip-text text-transparent hover:opacity-80 transition-opacity"
          >
            {isSignUp
              ? 'すでにアカウントを持っていますか？ サインイン →'
              : "アカウントを持っていませんか？ サインアップ →"}
          </button>
        </div>
      </div>
    </div>
  )
}
