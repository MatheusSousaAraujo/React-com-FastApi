// src/pages/HomePage.js
import React from 'react';
import { Link } from 'react-router-dom';

const HomePage = () => {
  return (
    <div style={{ textAlign: 'center', padding: '50px' }}>
      <h1>Bem-vindo ao Mural da Turma!</h1>
      <p>Um espaço para compartilhar ideias, avisos e conectar-se com seus colegas.</p>
      <p>Faça login ou crie sua conta para participar.</p>
      <Link to="/acesso">
        <button style={{ padding: '10px 20px', fontSize: '16px' }}>
          Entrar
        </button>
      </Link>
    </div>
  );
};

export default HomePage;