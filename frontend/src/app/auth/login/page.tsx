'use client'
import { useForm } from 'react-hook-form'
import { authApi } from '@/lib/api'
import { useAuthStore } from '@/store'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { useState } from 'react'
import { GoogleLogin } from '@react-oauth/google'

export default function LoginPage() {
  const { register, handleSubmit, formState: { errors } } = useForm()
  const setUser = useAuthStore(s => s.setUser)
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const onSubmit = async (data: any) => {
    setLoading(true)
    try {
      const res = await authApi.login(data)
      setUser(res.data.user, res.data.access, res.data.refresh)
      toast.success('Welcome back!')
      router.push('/')
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Login failed. Check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="card p-8">
          <div className="text-center mb-8">
            <div className="bg-red-600 text-white font-bold text-2xl px-4 py-2 rounded-xl inline-block mb-3">TN</div>
            <h1 className="text-2xl font-bold">Sign In</h1>
            <p className="text-gray-500 text-sm mt-1">Welcome back to TechNova Mart</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Email</label>
              <input
                {...register('email', { required: 'Email is required' })}
                type="email"
                placeholder="your@email.com"
                className="input"
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message as string}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Password</label>
              <input
                {...register('password', { required: 'Password is required' })}
                type="password"
                placeholder="••••••••"
                className="input"
              />
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message as string}</p>}
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base disabled:opacity-70">
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6">
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"></div></div>
              <div className="relative flex justify-center text-sm"><span className="px-2 bg-white text-gray-500">Or continue with</span></div>
            </div>

            <div className="flex justify-center">
              <GoogleLogin
                onSuccess={async (credentialResponse) => {
                  if (credentialResponse.credential) {
                    setLoading(true)
                    try {
                      const res = await authApi.googleLogin(credentialResponse.credential)
                      setUser(res.data.user, res.data.access, res.data.refresh)
                      toast.success('Welcome back!')
                      router.push('/')
                    } catch (err: any) {
                      toast.error('Google login failed.')
                    } finally {
                      setLoading(false)
                    }
                  }
                }}
                onError={() => {
                  toast.error('Google Login Failed')
                }}
                useOneTap
                theme="outline"
                shape="rectangular"
                width="100%"
              />
            </div>
          </div>

          <p className="text-center text-sm text-gray-500 mt-6">
            Don't have an account?{' '}
            <Link href="/auth/register" className="text-red-600 font-medium hover:text-red-700">Register</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
