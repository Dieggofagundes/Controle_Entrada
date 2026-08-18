import { Navigate, Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { ProtectedRoute } from './components/ProtectedRoute'
import { ToastProvider } from './context/ToastContext'
import CadastrarUsuario from './pages/CadastrarUsuario'
import Dashboard from './pages/Dashboard'
import EsqueciSenha from './pages/EsqueciSenha'
import Login from './pages/Login'
import RedefinirSenha from './pages/RedefinirSenha'
import SolicitacaoEnviada from './pages/SolicitacaoEnviada'
import Visitantes from './pages/Visitantes'
import AdminRelatorios from './pages/admin/AdminRelatorios'
import AdminUsuarios from './pages/admin/AdminUsuarios'

export default function App() {
  return (
    <ToastProvider>
      <Routes>
        {/* Publicas */}
        <Route path="/login" element={<Login />} />
        <Route path="/esqueci-senha" element={<EsqueciSenha />} />
        <Route path="/redefinir-senha/:token" element={<RedefinirSenha />} />
        <Route path="/cadastrar" element={<CadastrarUsuario />} />
        <Route path="/solicitacao-enviada" element={<SolicitacaoEnviada />} />

        {/* Protegidas */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/visitantes"
          element={
            <ProtectedRoute>
              <Layout>
                <Visitantes />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/usuarios"
          element={
            <ProtectedRoute apenasAdmin>
              <Layout>
                <AdminUsuarios />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/relatorios"
          element={
            <ProtectedRoute apenasAdmin>
              <Layout>
                <AdminRelatorios />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ToastProvider>
  )
}
