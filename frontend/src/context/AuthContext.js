// src/context/AuthContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Função centralizada para buscar os dados do usuário
  const fetchUser = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const response = await api.get('/users/me/');
        setUser(response.data);
      } catch (error) {
        console.error("Token inválido ou erro na API. Limpando sessão.", error);
        localStorage.removeItem('token');
        setUser(null);
      }
    }
  };

  // useEffect inicial para carregar o usuário na primeira vez
  useEffect(() => {
    const initialLoad = async () => {
      setLoading(true);
      await fetchUser();
      setLoading(false);
    };
    initialLoad();
  }, []); // Roda apenas uma vez na montagem

  const login = async (username, password) => {
    const response = await api.post('/login/', { username, password });
    const { access_token } = response.data;
    localStorage.setItem('token', access_token);
    // Define o cabeçalho para as próximas requisições desta sessão
    api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
    await fetchUser(); // Busca os dados do usuário recém-logado
    navigate('/mural');
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
    navigate('/');
  };

  // >>> NOVA FUNÇÃO PARA ATUALIZAR O USUÁRIO SOB DEMANDA <<<
  const refreshUser = async () => {
    console.log("AuthContext: Atualizando dados do usuário...");
    // Não precisa de setLoading aqui, para não piscar a tela inteira
    await fetchUser();
    console.log("AuthContext: Dados do usuário atualizados.");
  };

  const isAuthenticated = !!user;

  // Adiciona 'refreshUser' ao valor que o contexto fornece
  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout, loading, refreshUser }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);