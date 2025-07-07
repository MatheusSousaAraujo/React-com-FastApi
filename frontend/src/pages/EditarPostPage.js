// src/pages/EditarPostPage.js

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/api';

const EditarPostPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    api.get(`/posts/${id}`)
      .then(response => {
        setTitle(response.data.title);
        setText(response.data.text);
        setLoading(false);
      })
      .catch(() => {
        setError('Não foi possível carregar o post para edição. Você tem permissão?');
        setLoading(false);
      });
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.put(`/posts/${id}`, { title, text });
      navigate('/mural');
    } catch (err) {
      setError('Falha ao atualizar o post. Verifique os dados e tente novamente.');
    }
  };

  if (loading) return <div>Carregando post...</div>;
  if (error) return <p style={{color: 'red', textAlign: 'center'}}>{error}</p>;

  return (
    // --- Container Principal para Centralizar o Conteúdo ---
    <div style={{ 
        maxWidth: '800px', 
        margin: '0 auto',
        padding: '30px'
    }}>
      <form onSubmit={handleSubmit} className="form-card">
        <h2 style={{ marginTop: 0 }}>Editar Mensagem</h2>
        
        {/* Campo do Título */}
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="post-title" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Título
          </label>
          <input 
            id="post-title"
            type="text" 
            placeholder="Edite o título do seu post" 
            value={title} 
            onChange={e => setTitle(e.target.value)} 
            required 
            style={{ width: '100%' }}
          />
        </div>

        {/* Campo do Texto */}
        <div style={{ marginBottom: '20px' }}>
          <label htmlFor="post-text" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Conteúdo
          </label>
          <textarea 
            id="post-text"
            placeholder="Edite o conteúdo..." 
            value={text} 
            onChange={e => setText(e.target.value)} 
            rows="8" 
            required 
            style={{ 
              width: '100%', 
              resize: 'vertical',
              fontFamily: 'inherit'
            }} 
          />
        </div>

        {/* Botão de Salvar */}
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button 
            type="submit" 
            style={{ 
              backgroundColor: '#16a34a', // Verde, indicando sucesso/salvar
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '6px',
              fontWeight: 'bold',
              cursor: 'pointer',
              width: '180px' // Largura fixa para "Salvar Alterações"
            }}
          >
            Salvar Alterações
          </button>
        </div>

        {error && <p style={{ color: 'red', marginTop: '15px', textAlign: 'center' }}>{error}</p>}
      </form>
    </div>
  );
};

export default EditarPostPage;