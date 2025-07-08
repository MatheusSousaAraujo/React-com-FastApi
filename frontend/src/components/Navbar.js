// src/components/Navbar.js

import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { isAuthenticated, logout, user } = useAuth();
  
  // Estados para controlar o efeito hover nos botões
  const [isLogoutHovered, setIsLogoutHovered] = useState(false);
  const [isLoginHovered, setIsLoginHovered] = useState(false);

  // --- ESTILOS (Mantidos como você criou) ---

  const navStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0 2rem',
    height: '65px',
    backgroundColor: '#1a202c', 
    color: '#e2e8f0', 
    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    flexWrap: 'nowrap',
  };

  const navBrandStyle = {
    fontSize: '1.75rem',
    fontWeight: 'bold',
    color: '#ffffff',
    textDecoration: 'none',
    whiteSpace: 'nowrap',
    marginRight: '2rem',
  };

  const navLinksContainerStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '25px', 
    flexShrink: 0,
  };

  const getLinkStyle = ({ isActive }) => ({
    color: isActive ? '#63b3ed' : '#a0aec0',
    textDecoration: 'none',
    fontWeight: '500',
    padding: '8px 0',
    borderBottom: isActive ? '2px solid #63b3ed' : '2px solid transparent',
    transition: 'color 0.2s ease-in-out, border-bottom 0.2s ease-in-out',
    whiteSpace: 'nowrap',
  });

  const buttonBaseStyle = {
    color: 'white',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 'bold',
    transition: 'background-color 0.3s ease, transform 0.1s ease',
    whiteSpace: 'nowrap',
  };

  const logoutButtonStyle = {
    ...buttonBaseStyle,
    backgroundColor: isLogoutHovered ? '#c53030' : '#e53e3e',
    transform: isLogoutHovered ? 'scale(1.05)' : 'scale(1)',
  };

  const loginButtonStyle = {
    ...buttonBaseStyle,
    backgroundColor: isLoginHovered ? '#2b6cb0' : '#3182ce',
    transform: isLoginHovered ? 'scale(1.05)' : 'scale(1)',
    textDecoration: 'none',
  };

  const usernameStyle = {
    color: '#e2e8f0',
    fontWeight: '500',
    marginRight: '10px',
    whiteSpace: 'nowrap',
  };

  // --- RENDERIZAÇÃO ---
  return (
    <nav style={navStyle}>
      {/* Lado Esquerdo: Marca (Agora sempre leva para a lista de Fóruns) */}
      <div>
        <NavLink to="/" style={navBrandStyle}>
          FórumDev
        </NavLink>
      </div>

      {/* Lado Direito: Links de Navegação e Ações */}
      <div style={navLinksContainerStyle}>
        {isAuthenticated ? (
          <>
            {/* Links para as páginas */}
            <NavLink to="/mural" style={getLinkStyle}>Meu Feed</NavLink> {/* Renomeado para clareza */}
            <NavLink to="/criar-grupo" style={getLinkStyle}>Criar Fórum</NavLink> {/* Adicionado */}
            <NavLink to="/meu-perfil" style={getLinkStyle}>Meu Perfil</NavLink>
            
            {/* Informações do usuário e botão de logout */}
            <span style={usernameStyle}>Olá, {user?.username}</span>
            <button
              onClick={logout}
              style={logoutButtonStyle}
              onMouseEnter={() => setIsLogoutHovered(true)}
              onMouseLeave={() => setIsLogoutHovered(false)}
            >
              Sair
            </button>
          </>
        ) : (
          // Botão de Login para usuários deslogados
          <NavLink
            to="/acesso"
            style={loginButtonStyle}
            onMouseEnter={() => setIsLoginHovered(true)}
            onMouseLeave={() => setIsLoginHovered(false)}
          >
            Login / Cadastrar
          </NavLink>
        )}
      </div>
    </nav>
  );
};

export default Navbar;