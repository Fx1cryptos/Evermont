import { defineConfig, loadEnv, type UserConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

import { requiresStagingTarget, resolveSupabaseAnonKey, resolveSupabaseUrl } from './shared/supabasePublicConfig'

export default defineConfig(async ({ command, mode }): Promise<UserConfig> => {
  const env = loadEnv(mode, process.cwd(), '')
  const offline = command === 'serve' && mode === 'offline' && !requiresStagingTarget(env)
  const supabaseUrl = offline ? '' : resolveSupabaseUrl(env,true)
  const supabaseAnonKey = offline ? '' : await resolveSupabaseAnonKey({
    VITE_SUPABASE_PUBLISHABLE_KEY: env.VITE_SUPABASE_PUBLISHABLE_KEY,
    VITE_SUPABASE_ANON_KEY: env.VITE_SUPABASE_ANON_KEY,
  }, supabaseUrl)

  return {
    // Only the two explicitly classified public values below enter browser code.
    envPrefix: [],
    plugins: [react()],
    ssr: { noExternal: ['react-helmet-async'] },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      port: 5173,
      strictPort: false,
      allowedHosts: true,
    },
    define: {
      'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(supabaseUrl),
      'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(supabaseAnonKey),
    },
  }
})
