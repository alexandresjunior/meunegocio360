// API pública da feature da página inicial (RNF-FE-01).
import { lazy } from 'react'

// Página carregada sob demanda (RNF-FE-05).
export const HomePage = lazy(() => import('./pages/HomePage.jsx'))
