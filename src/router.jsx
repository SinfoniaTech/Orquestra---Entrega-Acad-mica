// Rotas do app: mobile (/) e backoffice (/backoffice)

import { createHashRouter, Navigate } from 'react-router-dom'
import AppShellLayout from './layouts/AppShellLayout.jsx'
import BackofficeLayout from './layouts/BackofficeLayout.jsx'
import Home from './pages/Home.jsx'
import Alerts from './pages/Alerts.jsx'
import RedirecionaCriticidade from './pages/RedirecionaCriticidade.jsx'
import Detail from './pages/Detail.jsx'
import Resumo from './pages/Detail/Resumo.jsx'
import LinhaDoTempo from './pages/Detail/LinhaDoTempo.jsx'
import Historico from './pages/Detail/Historico.jsx'
import BackofficeChamados from './pages/BackofficeChamados.jsx'
import BackofficePainel from './pages/BackofficePainel.jsx'
import EmDesenvolvimento from './pages/EmDesenvolvimento.jsx'
import NotFound from './pages/NotFound.jsx'

export const router = createHashRouter([
  {
    path: '/',
    element: <AppShellLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'alertas', element: <Alerts /> },
      { path: 'criticidade/:nivel', element: <RedirecionaCriticidade /> },
      {
        path: 'chamados/:id',
        element: <Detail />,
        children: [
          { index: true, element: <Navigate to='resumo' replace /> },
          { path: 'resumo', element: <Resumo /> },
          { path: 'linha-do-tempo', element: <LinhaDoTempo /> },
          { path: 'historico', element: <Historico /> },
        ],
      },
      { path: 'mais', element: <Navigate to='/' replace /> },
      { path: '*', element: <Navigate to='/' replace /> },
    ],
  },
  {
    path: '/backoffice',
    element: <BackofficeLayout />,
    children: [
      { index: true, element: <Navigate to='painel' replace /> },
      { path: 'chamados', element: <BackofficeChamados /> },
      { path: 'painel', element: <BackofficePainel /> },
      { path: 'contratos', element: <EmDesenvolvimento titulo='Contratos' /> },
      { path: 'equipamentos', element: <EmDesenvolvimento titulo='Equipamentos' /> },
      { path: 'tecnicos', element: <EmDesenvolvimento titulo='Técnicos' /> },
      { path: 'treinamentos', element: <EmDesenvolvimento titulo='Treinamentos' /> },
      { path: 'relatorios', element: <EmDesenvolvimento titulo='Relatórios' /> },
      { path: 'configuracoes', element: <EmDesenvolvimento titulo='Configurações' /> },
      {
        path: '*',
        element: <Navigate to='/' replace />,
      },
    ],
  },
])