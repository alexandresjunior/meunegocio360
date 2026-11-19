import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { lazy, Suspense } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router'
import {
  AuthProvider,
  GuardaInicializacao,
  LoginPage,
  RequireAuth,
  SomenteAnonimo,
} from '../features/auth/index.js'
import { HomePage } from '../features/home/index.js'
import { ApiError } from '../shared/lib/http.js'
import TelaCarregando from '../shared/ui/TelaCarregando.jsx'

const PaginaNaoEncontrada = lazy(
  () => import('../shared/ui/PaginaNaoEncontrada.jsx'),
)

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Erros 4xx não melhoram com nova tentativa; o 401 já é tratado no cliente HTTP.
      retry: (tentativas, erro) =>
        !(
          erro instanceof ApiError &&
          erro.status >= 400 &&
          erro.status < 500
        ) && tentativas < 2,
    },
  },
})

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <GuardaInicializacao>
            <Suspense fallback={<TelaCarregando />}>
              <Routes>
                <Route
                  path="/login"
                  element={
                    <SomenteAnonimo>
                      <LoginPage />
                    </SomenteAnonimo>
                  }
                />
                <Route
                  path="/"
                  element={
                    <RequireAuth>
                      <HomePage />
                    </RequireAuth>
                  }
                />
                <Route path="*" element={<PaginaNaoEncontrada />} />
              </Routes>
            </Suspense>
          </GuardaInicializacao>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
