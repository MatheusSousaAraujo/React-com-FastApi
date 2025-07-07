// src/pages/MeuPerfilPage.js

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';
import { Link } from 'react-router-dom'; // Importe o Link para os posts

const MeuPerfilPage = () => {
  const { user } = useAuth();
  const [myPosts, setMyPosts] = useState([]);
  const [allComments, setAllComments] = useState([]); // Novo estado para todos os comentários
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      api.get(`/authors/${user.id}/posts/`)
        .then(response => {
          const posts = response.data;
          setMyPosts(posts);

          // Coleta todos os comentários de todos os posts em uma única lista
          const comments = posts.flatMap(post => 
            // Adiciona o título do post a cada comentário para dar contexto
            post.comments.map(comment => ({ ...comment, postTitle: post.title }))
          );
          // Ordena os comentários pelos mais recentes
          comments.sort((a, b) => new Date(b.date) - new Date(a.date));
          setAllComments(comments);
        })
        .catch(err => console.error("Erro ao buscar dados do perfil:", err))
        .finally(() => setLoading(false));
    }
  }, [user]);

  if (loading || !user) {
    return <div>Carregando perfil...</div>;
  }

  // --- Estilos para o Layout ---
  const profileContainerStyle = {
    maxWidth: '1200px', // Largura maior para acomodar duas colunas
    margin: '0 auto',
    padding:"50px"
  };

  const gridContainerStyle = {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr', // Coluna da esquerda (posts) é 2x maior que a da direita
    gap: '30px', // Espaço entre as colunas
    marginTop: '20px',
  };

  const columnStyle = {
    background: '#ffffff',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
  };

  return (
    <div style={profileContainerStyle}>
      {/* --- Informações do Usuário --- */}
      <div style={columnStyle}>
        <h2 style={{ marginTop: 0 }}>Meu Perfil</h2>
        <p><strong>Usuário:</strong> {user.username}</p>
        <p><strong>Email:</strong> {user.email}</p>
        {/* Futuramente, o botão de editar perfil entraria aqui */}
      </div>

      {/* --- Layout de Duas Colunas --- */}
      <div style={gridContainerStyle}>
        
        {/* --- Coluna da Esquerda: Meus Posts --- */}
        <div style={columnStyle}>
          <h3 style={{ marginTop: 0 }}>Minhas Mensagens ({myPosts.length})</h3>
          {myPosts.length > 0 ? (
            myPosts.map(post => (
              <div key={post.id} style={{ borderBottom: '1px solid #eee', paddingBottom: '15px', marginBottom: '15px' }}>
                {/* Tornamos o título um link para a página do post no mural (se houver) */}
                <Link to={`/mural`} style={{ textDecoration: 'none' }}> 
                  <h4 style={{ margin: 0, color: '#2563eb' }}>{post.title}</h4>
                </Link>
                <p style={{ margin: '5px 0 0 0', color: '#4b5563' }}>{post.text}</p>
                <small>Comentários recebidos: {post.comments.length}</small>
              </div>
            ))
          ) : (
            <p>Você ainda não publicou nenhuma mensagem.</p>
          )}
        </div>

        {/* --- Coluna da Direita: Comentários nos Meus Posts --- */}
        <div style={columnStyle}>
          <h3 style={{ marginTop: 0 }}>Atividade Recente ({allComments.length})</h3>
          {allComments.length > 0 ? (
            allComments.map(comment => (
              <div key={comment.id} style={{ borderBottom: '1px solid #eee', paddingBottom: '10px', marginBottom: '10px' }}>
                <p style={{ margin: 0 }}>
                  <strong>{comment.commenter.username}</strong> comentou: <em>"{comment.text}"</em>
                </p>
                <small style={{ color: '#6b7280' }}>
                  no post "{comment.postTitle}" em {new Date(comment.date).toLocaleDateString()}
                </small>
              </div>
            ))
          ) : (
            <p>Nenhum comentário em suas publicações ainda.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default MeuPerfilPage;