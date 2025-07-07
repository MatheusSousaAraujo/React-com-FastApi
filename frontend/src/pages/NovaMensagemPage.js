// src/pages/NovaMensagemPage.js

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';

const NovaMensagemPage = () => {
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/posts/', { title, text });
      navigate('/mural');
    } catch (err) {
      setError('Erro ao criar a mensagem.');
    }
  };

  return (
    // --- Container Principal para Centralizar o Conteúdo ---
    <div style={{ 
        maxWidth: '800px', 
        margin: '0 auto',
        padding:"30px"
    }}>
      {/* O formulário agora usa a classe CSS que definimos em index.css */}
      <form onSubmit={handleSubmit} className="form-card"> 
        <h2 style={{ marginTop: 0 }}>Criar Nova Mensagem</h2>
        
        {/* Campo do Título */}
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="post-title" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Título
          </label>
          <input 
            id="post-title"
            type="text" 
            placeholder="Digite o título do seu post" 
            value={title} 
            onChange={e => setTitle(e.target.value)} 
            required 
            style={{ width: '100%' }} // Garante que o input preencha o espaço
          />
        </div>

        {/* Campo do Texto */}
        <div style={{ marginBottom: '20px' }}>
          <label htmlFor="post-text" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Conteúdo
          </label>
          <textarea 
            id="post-text"
            placeholder="O que você está pensando?" 
            value={text} 
            onChange={e => setText(e.target.value)} 
            rows="8" // Aumentei para 8 linhas para dar mais espaço
            required 
            style={{ 
              width: '100%', 
              resize: 'vertical',
              fontFamily: 'inherit' // Garante a mesma fonte do resto da página
            }} 
          />
        </div>

        {/* Botão de Publicar */}
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button 
            type="submit" 
            style={{ 
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '6px',
              fontWeight: 'bold',
              cursor: 'pointer',
             
              width: '100px' 
            }}
          >
            Publicar
          </button>
        </div>

        {error && <p style={{ color: 'red', marginTop: '15px', textAlign: 'center' }}>{error}</p>}
      </form>
    </div>
  );
};

export default NovaMensagemPage;