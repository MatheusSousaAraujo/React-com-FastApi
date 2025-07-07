// src/App.js

import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from "./components/Navbar";
import ProtectedRoute from './components/ProtectedRoute';

// Suas páginas existentes
import HomePage from './pages/HomePage';
import AcessoPage from './pages/AcessoPage';
import MuralPage from './pages/MuralPage';
import NovaMensagemPage from './pages/NovaMensagemPage';
import MeuPerfilPage from './pages/MeuPerfilPage';
import EditarPostPage from './pages/EditarPostPage';

// >>> NOVA PÁGINA A SER IMPORTADA <<<
import GroupDetailPage from './pages/GroupDetailPage';
import CriarGrupoPage from './pages/CriarGrupoPage';

import './index.css';

function App() {
  const appContainerStyle = {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    backgroundColor: '#f4f7f6',
  };

  const mainContentStyle = {
    flex: 1,
    overflowY: 'auto',
    padding: '2rem',
    boxSizing: 'border-box',
  };

  return (
    <div style={appContainerStyle}>
      <BrowserRouter>
        <AuthProvider>
          <Navbar />

          <main style={mainContentStyle}>
            <Routes>
              {/* --- Rotas Públicas --- */}
              <Route path="/" element={<HomePage />} />
              <Route path="/acesso" element={<AcessoPage />} />

              {/* >>> NOVA ROTA PÚBLICA PARA DETALHES DO GRUPO <<< */}
              <Route path="/groups/:groupId" element={<GroupDetailPage />} />
              <Route path="/criar-grupo" element={<CriarGrupoPage />} /> 

              {/* --- Rotas Protegidas (Mantendo as suas) --- */}
              <Route element={<ProtectedRoute />}>
                <Route path="/mural" element={<MuralPage />} />
                <Route path="/nova-mensagem" element={<NovaMensagemPage />} />
                <Route path="/meu-perfil" element={<MeuPerfilPage />} />
                <Route path="/editar-post/:id" element={<EditarPostPage />} />
              </Route>
            </Routes>
          </main>
        </AuthProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;