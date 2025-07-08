// src/pages/MeuPerfilPage.js

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';
import { Link } from 'react-router-dom';

const MeuPerfilPage = () => {
  const { user } = useAuth(); // O 'user' do contexto já contém a lista de grupos
  const [myPosts, setMyPosts] = useState([]);
  const [allComments, setAllComments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // A lógica de buscar os posts e comentários está perfeita e não precisa mudar.
    if (user) {
      api.get(`/authors/${user.id}/posts/`)
        .then(response => {
          const posts = response.data;
          setMyPosts(posts);

          const comments = posts.flatMap(post => 
            post.comments.map(comment => ({ ...comment, postTitle: post.title }))
          );
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
    maxWidth: '1200px',
    margin: '0 auto',
    padding: "0, 50px, 50px"
  };

  const gridContainerStyle = {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr',
    gap: '30px',
    marginTop: '20px',
  };

  const columnStyle = {
    background: '#ffffff',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
    border: '1px solid rgb(209, 213, 219)',
  };

  // --- Estilo para a lista de grupos ---
  const groupListStyle = {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '10px',
      padding: 0,
      listStyleType: 'none',
      marginTop: '10px'
  };

  const groupTagStyle = {
      background: '#e0e7ff',
      color: '#4338ca',
      padding: '5px 10px',
      borderRadius: '12px',
      fontSize: '0.9em',
      fontWeight: '500'
  };


  return (
    <div style={profileContainerStyle}>
      {/* --- Informações do Usuário (ATUALIZADO COM GRUPOS) --- */}
      <div style={columnStyle}>
        <h2 style={{ marginTop: 0 }}>Meu Perfil</h2>
        <p><strong>Usuário:</strong> {user.username}</p>
        <p><strong>Email:</strong> {user.email}</p>
        
        {/* >>> NOVA SEÇÃO PARA MOSTRAR OS GRUPOS <<< */}
        <hr style={{ border: 'none', borderTop: '1px solid #eee', margin: '20px 0' }}/>
        <div>
            <h3 style={{ margin: 0 }}>Meus Fóruns</h3>
            {user.groups && user.groups.length > 0 ? (
                <ul style={groupListStyle}>
                    {user.groups.map(group => (
                        <li key={group.id} style={groupTagStyle}>
                            {group.name}
                        </li>
                    ))}
                </ul>
            ) : (
                <p>Você ainda não participa de nenhum fórum.</p>
            )}
        </div>
      </div>

      {/* --- Layout de Duas Colunas (Inalterado) --- */}
      <div style={gridContainerStyle}>
        
        {/* --- Coluna da Esquerda: Meus Posts --- */}
        <div style={columnStyle}>
          <h3 style={{ marginTop: 0 }}>Minhas Mensagens ({myPosts.length})</h3>
          {myPosts.length > 0 ? (
            myPosts.map(post => (
              <div key={post.id} style={{ borderBottom: '1px solid #eee', paddingBottom: '15px', marginBottom: '15px' }}>
                <Link to={`/groups/${post.group.id}`} style={{ textDecoration: 'none' }}> 
                  <h4 style={{ margin: 0, color: '#2563eb' }}>{post.title}</h4>
                </Link>
                 {/* Adicionando o grupo do post */}
                <small style={{ color: '#6b7280' }}>no fórum: {post.group.name}</small>
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