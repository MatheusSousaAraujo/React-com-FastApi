// src/components/Navbar.js

import React, { useState } from 'react';
import { NavLink } from 'react-router-dom'; // Usamos NavLink para estilizar o link ativo
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { isAuthenticated, logout, user } = useAuth();
  
  // Estados para controlar o efeito hover nos botões
  const [isLogoutHovered, setIsLogoutHovered] = useState(false);
  const [isLoginHovered, setIsLoginHovered] = useState(false);

  // --- ESTILOS ---

  const navStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0 2rem',
    height: '65px',
    backgroundColor: '#1a202c', // Um cinza escuro, quase preto
    color: '#e2e8f0', // Texto principal claro
    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    flexWrap: 'nowrap',
    position: 'fixed',    // Fixa o Navbar na janela de visualização
    top: 0,               // Cola no topo
    left: 0,              // Estica da esquerda...
    right: 0,             // ...até a direita (ocupa 100% da largura)
    zIndex: 1000, // Impede que os itens principais (logo e links) quebrem para a próxima linha
  };

  const navBrandStyle = {
    fontSize: '1.75rem',
    fontWeight: 'bold',
    color: '#ffffff',
    textDecoration: 'none',
    whiteSpace: 'nowrap', // Impede que o texto "MuralDev" quebre
    marginRight: '2rem',  // Garante um espaço à direita da marca
  };

  const navLinksContainerStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '25px', // Um pouco mais de espaço entre os itens
    flexShrink: 0, // Impede que este container encolha e quebre os links
  };

  // Função para estilizar o NavLink. A 'isActive' é fornecida pelo NavLink.
  const getLinkStyle = ({ isActive }) => ({
    color: isActive ? '#63b3ed' : '#a0aec0', // Azul para ativo, cinza para inativo
    textDecoration: 'none',
    fontWeight: '500',
    padding: '8px 0',
    borderBottom: isActive ? '2px solid #63b3ed' : '2px solid transparent', // Sublinhado para o link ativo
    transition: 'color 0.2s ease-in-out, border-bottom 0.2s ease-in-out',
    whiteSpace: 'nowrap', // Garante que textos como "Nova Mensagem" não quebrem
  });

  const buttonBaseStyle = {
    color: 'white',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 'bold',
    transition: 'background-color 0.3s ease, transform 0.1s ease',
    whiteSpace: 'nowrap', // Garante que o texto do botão não quebre
  };

  const logoutButtonStyle = {
    ...buttonBaseStyle,
    backgroundColor: isLogoutHovered ? '#c53030' : '#e53e3e', // Vermelho para sair
    transform: isLogoutHovered ? 'scale(1.05)' : 'scale(1)',
  };

  const loginButtonStyle = {
    ...buttonBaseStyle,
    backgroundColor: isLoginHovered ? '#2b6cb0' : '#3182ce', // Azul para login
    transform: isLoginHovered ? 'scale(1.05)' : 'scale(1)',
    textDecoration: 'none', // Para o caso de ser um NavLink
  };

  const usernameStyle = {
    color: '#e2e8f0',
    fontWeight: '500',
    marginRight: '10px',
    whiteSpace: 'nowrap', // Garante que "Olá, usuário" não quebre
  };

  // --- RENDERIZAÇÃO ---
  return (
    <nav style={navStyle}>
      {/* Lado Esquerdo: Marca */}
      <div>
        <NavLink to={isAuthenticated ? "/mural" : "/"} style={navBrandStyle}>
          MuralDev
        </NavLink>
      </div>

      {/* Lado Direito: Links de Navegação e Ações */}
      <div style={navLinksContainerStyle}>
        {isAuthenticated ? (
          <>
            {/* Links para as páginas */}
            <NavLink to="/mural" style={getLinkStyle}>Mural</NavLink>
            <NavLink to="/nova-mensagem" style={getLinkStyle}>Nova Mensagem</NavLink>
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