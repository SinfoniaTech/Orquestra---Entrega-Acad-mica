import { createBrowserRouter, Navigate } from 'react-router-dom'
import AppShellLayout from './layouts/AppShellLayout.jsx'
import BackofficeLayout from './layouts/BackofficeLayout.jsx'
import Home from './pages/Home.jsx'
import Alerts from './pages/Alerts.jsx'
import RedirecionaCriticidade from './pages/RedirecionaCriticidade.jsx'
import Detail from './pages/Detail.jsx'
import Resumo from './pages/Detail/Resumo.jsx'
import LinhaDoTempo from './pages/Detail/LinhaDoTempo.jsx'
import Historico from './pages/Detail/Historico.jsx'
import More from './pages/More.jsx'
import BackofficeChamados from './pages/BackofficeChamados.jsx'
import BackofficePainel from './pages/BackofficePainel.jsx'
import NotFound from './pages/NotFound.jsx'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShellLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'alertas', element: <Alerts /> },
      // Rotas antigas de criticidade: redirecionam para a Home com o filtro aplicado
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
      { path: 'mais', element: <More /> },
      // Qualquer endereco nao mapeado exibe a pagina 404
      { path: '*', element: <NotFound /> },
    ],
  },
  {
    path: '/backoffice',
    element: <BackofficeLayout />,
    children: [
      { index: true, element: <Navigate to='painel' replace /> },
      { path: 'chamados', element: <BackofficeChamados /> },
      { path: 'painel', element: <BackofficePainel /> },
      {
        path: '*',
        element: <NotFound voltarPara='/backoffice/painel' voltarTexto='Voltar para o Painel Operacional' />,
      },
    ],
  },
])
