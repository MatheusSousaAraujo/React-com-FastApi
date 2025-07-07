// src/App.js

import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from "./components/Navbar";
import ProtectedRoute from './components/ProtectedRoute';

import HomePage from './pages/HomePage';
import AcessoPage from './pages/AcessoPage';
import MuralPage from './pages/MuralPage';
import NovaMensagemPage from './pages/NovaMensagemPage';
import MeuPerfilPage from './pages/MeuPerfilPage';
import EditarPostPage from './pages/EditarPostPage'; 

import './index.css'; 

function App() {
  const appContainerStyle = {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    backgroundColor: '#f4f7f6', // Um fundo suave para o corpo da aplicação
  };

  const mainContentStyle = {
    flex: 1,
    overflowY: 'auto',
    padding: '2rem', // Espaçamento interno para o conteúdo
    boxSizing: 'border-box', // Garante que o padding não aumente o tamanho total
  };

  return (
    <div style={appContainerStyle}>
      <BrowserRouter>
        <AuthProvider>
          <Navbar />

          <main style={mainContentStyle}>
            <Routes>
              {/* --- Rotas --- */}
              <Route path="/" element={<HomePage />} />
              <Route path="/acesso" element={<AcessoPage />} />
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