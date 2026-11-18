import { createBrowserRouter } from 'react-router'
import { LoginPage, RequireAuth } from '../features/auth'
import { InicioPage } from '../features/inicio'
import { NaoEncontradaPage } from './pages'
import { RootLayout } from './RootLayout'

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      { path: '/login', element: <LoginPage /> },
      {
        element: <RequireAuth />,
        children: [{ path: '/', element: <InicioPage /> }],
      },
      { path: '*', element: <NaoEncontradaPage /> },
    ],
  },
])
