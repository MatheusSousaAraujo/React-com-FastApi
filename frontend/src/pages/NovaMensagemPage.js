// src/pages/NovaMensagemPage.js

import React, { useState, useEffect } from 'react';
// Importa useLocation para ler o estado da rota
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';

const NovaMensagemPage = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Tenta pegar o grupo pré-selecionado do estado da navegação
  const preselectedGroup = location.state?.preselectedGroup;

  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  // O estado inicial do dropdown agora depende se um grupo foi passado
  const [selectedGroupId, setSelectedGroupId] = useState(preselectedGroup?.id?.toString() || '');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canSubmit = selectedGroupId && title.trim() && text.trim() && !isSubmitting;

  // Define um grupo padrão APENAS se nenhum foi pré-selecionado
  useEffect(() => {
    if (!preselectedGroup && !authLoading && user?.groups?.length > 0) {
      // Se não há grupo selecionado, define o primeiro da lista.
      if (!selectedGroupId) {
        setSelectedGroupId(user.groups[0].id.toString());
      }
    }
  }, [user, authLoading, preselectedGroup, selectedGroupId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) {
      setError('Todos os campos são obrigatórios e um grupo deve ser selecionado.');
      return;
    }
    setError('');
    setIsSubmitting(true);
    try {
      const payload = { title, text, group_id: parseInt(selectedGroupId, 10) };
      await api.post('/posts/', payload);
      navigate('/mural');
    } catch (err) {
      console.error("ERRO ao criar post:", err.response?.data || err);
      let errorMessage = 'Ocorreu um erro inesperado ao criar a mensagem.';
      if (err.response?.data?.detail) {
        const detail = err.response.data.detail;
        errorMessage = typeof detail === 'string' ? detail : `Erro no campo '${detail[0].loc[1]}': ${detail[0].msg}`;
      }
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading) {
    return <div>Carregando informações do usuário...</div>;
  }

  if (!user) {
    return <div>Você precisa estar logado para criar uma mensagem.</div>;
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: "30px" }}>
      <form onSubmit={handleSubmit} className="form-card">
        <h2 style={{ marginTop: 0 }}>
          {/* Título dinâmico: mostra o nome do fórum se pré-selecionado */}
          {preselectedGroup ? `Criar Post no Fórum: "${preselectedGroup.name}"` : 'Criar Nova Mensagem'}
        </h2>
        
        {/* --- LÓGICA DO DROPDOWN DE GRUPO --- */}
        <div style={{ marginBottom: '20px' }}>
          {/* Só mostra o dropdown se um grupo NÃO foi pré-selecionado */}
          {!preselectedGroup ? (
            <>
              <label htmlFor="group-select" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Postar no Fórum
              </label>
              <select 
                id="group-select" 
                value={selectedGroupId} 
                onChange={e => setSelectedGroupId(e.target.value)}
                required
                disabled={!user.groups || user.groups.length === 0}
                style={{ width: '100%', padding: '10px', fontFamily: 'inherit', border: '1px solid #ccc', borderRadius: '5px' }}
              >
                <option value="" disabled>Selecione um grupo...</option>
                {user.groups && user.groups.map(group => (
                  <option key={group.id} value={group.id.toString()}>
                    {group.name}
                  </option>
                ))}
              </select>
              {(!user.groups || user.groups.length === 0) && <small>Você precisa entrar em um grupo para poder postar.</small>}
            </>
          ) : null /* Se um grupo foi pré-selecionado, não renderiza nada aqui */}
        </div>

        {/* --- CAMPOS DE TÍTULO E TEXTO --- */}
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="post-title" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Título</label>
          <input id="post-title" type="text" value={title} onChange={e => setTitle(e.target.value)} required style={{ width: '100%' }}/>
        </div>
        <div style={{ marginBottom: '20px' }}>
          <label htmlFor="post-text" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Conteúdo</label>
          <textarea id="post-text" value={text} onChange={e => setText(e.target.value)} rows="8" required style={{ width: '100%', resize: 'vertical', fontFamily: 'inherit' }}/>
        </div>
        
        {/* --- FEEDBACK E BOTÃO DE SUBMISSÃO --- */}
        {error && (
            <div style={{ color: '#721c24', backgroundColor: '#f8d7da', border: '1px solid #f5c6cb', padding: '10px', borderRadius: '5px', marginBottom: '15px', textAlign: 'center' }}>
                {error}
            </div>
        )}
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button type="submit" disabled={!canSubmit} style={{ 
              backgroundColor: canSubmit ? '#3b82f6' : '#9ca3af', 
              cursor: canSubmit ? 'pointer' : 'not-allowed', 
              color: 'white', border: 'none', padding: '10px 20px', 
              borderRadius: '6px', fontWeight: 'bold', minWidth: '100px'
          }}>
            {isSubmitting ? 'Enviando...' : 'Publicar'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default NovaMensagemPage;