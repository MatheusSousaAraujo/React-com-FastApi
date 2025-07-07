// src/components/ProtectedRoute.js - VERSÃO CORRETA

import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = () => {
  const { isAuthenticated, loading } = useAuth();

  // Mostra uma tela de carregamento enquanto o status de auth é verificado
  if (loading) {
    return <div>Verificando autenticação...</div>;
  }

  // Se autenticado, renderiza o componente da rota aninhada (MuralPage, etc.).
  // Se não, redireciona para a página de acesso.
  // Não há nenhum Navbar aqui.
  return isAuthenticated ? <Outlet /> : <Navigate to="/acesso" replace />;
};

export default ProtectedRoute;