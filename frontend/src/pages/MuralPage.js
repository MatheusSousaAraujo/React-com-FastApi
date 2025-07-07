// src/pages/MuralPage.js

import React, { useState, useEffect } from 'react';
import api from '../api/api';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import editIcon from '../edit.png';

const MuralPage = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [commentText, setCommentText] = useState({});
    const { user } = useAuth();

    const fetchPosts = async () => {
        setLoading(true);
        try {
            const response = await api.get('/posts/');
            setPosts(response.data);
        } catch (err) {
            setError('Não foi possível carregar o mural.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPosts();
    }, []);

    const handleCommentSubmit = async (e, postId) => {
        e.preventDefault();
        if (!commentText[postId] || !commentText[postId].trim()) return;

        try {
            await api.post(`/posts/${postId}/comments/`, {
                title: "Comentário",
                text: commentText[postId],
            });
            setCommentText(prev => ({ ...prev, [postId]: '' }));
            fetchPosts();
        } catch (err) {
            alert('Erro ao enviar comentário.');
        }
    };

    const handleDeletePost = async (postId) => {
        if (window.confirm('Tem certeza que deseja excluir este post?')) {
            try {
                await api.delete(`/posts/${postId}`);
                setPosts(currentPosts => currentPosts.filter(post => post.id !== postId));
            } catch (err) {
                alert('Erro ao excluir o post.');
            }
        }
    };

    const handleDeleteComment = async (commentId) => {
        if (window.confirm('Tem certeza que deseja excluir este comentário?')) {
            try {
                await api.delete(`/comments/${commentId}`);
                fetchPosts();
            } catch (err) {
                alert('Erro ao excluir o comentário.');
            }
        }
    };

    if (loading) return <div>Carregando mural...</div>;
    if (error) return <p style={{ color: 'red' }}>{error}</p>;

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h1 style={{ color: '#111827' }}>Mural da Turma</h1>
            {posts.map(post => (
                <div key={post.id} style={{
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    marginBottom: '20px',
                    background: '#ffffff',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)'
                }}>
                    <div style={{ padding: '20px' }}>
                        <div>
                            <h2 style={{ margin: 0, color: '#1f2937' }}>{post.title}</h2>
                            <small style={{ display: 'block', marginTop: '8px', color: '#6b7280' }}>
                                por: {post.author.username} em {new Date(post.date).toLocaleString()}
                            </small>
                        </div>
                        <p style={{ marginTop: '15px', color: '#374151', lineHeight: '1.6' }}>
                            {post.text}
                        </p>
                        {user && user.id === post.author.id && (
                            <div style={{
                                display: 'flex',
                                marginTop: '20px'
                            }}>
                                <div style={{
                                    marginLeft: 'auto',
                                    display: 'flex',
                                    gap: '10px'
                                }}>
                                    <Link to={`/editar-post/${post.id}`}>
                                        <button style={{
                                            backgroundColor: '#f59e0b',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '6px',
                                            cursor: 'pointer',
                                            fontWeight: 'bold',
                                            minWidth: '40px'
                                        }}>
                                            <img src={editIcon} alt="Editar" style={{ width: '16px', height: '16px' }} />
                                        
                                        </button>
                                    </Link>
                                    <button onClick={() => handleDeletePost(post.id)} style={{
                                        backgroundColor: '#ef4444',
                                        color: 'white',
                                        border: 'none',
                                        padding: '8px 16px',
                                        borderRadius: '6px',
                                        cursor: 'pointer',
                                        fontWeight: 'bold',
                                        minWidth: '90px'
                                    }}>
                                        Excluir
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {post.comments.length > 0 && (
                        <div style={{
                            backgroundColor: '#f9fafb',
                            borderTop: '1px solid #e5e7eb',
                            padding: '20px'
                        }}>
                            <h4 style={{ marginTop: 0, marginBottom: '15px', color: '#4b5563' }}>Comentários</h4>
                            {post.comments.map(comment => (
                                <div key={comment.id} style={{
                                    borderLeft: '3px solid #d1d5db',
                                    paddingLeft: '15px',
                                    marginBottom: '15px'
                                }}>
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'flex-start',
                                        gap: '10px'
                                    }}>
                                        <p style={{ margin: 0, flex: '1 1 auto', wordBreak: 'break-word', color: '#111827' }}>
                                            {comment.text}
                                        </p>
                                        {user && user.id === comment.commenter.id && (
                                            <button
                                                onClick={() => handleDeleteComment(comment.id)}
                                                style={{
                                                    backgroundColor: '#EF4444',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '10%',
                                                    width: '24px',
                                                    height: '24px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    cursor: 'pointer',
                                                    flexShrink: 0,
                                                    userSelect: 'none'
                                                }}
                                            >
                                                X
                                            </button>
                                        )}
                                    </div>
                                    <small style={{ color: '#6b7280' }}>
                                        por: {comment.commenter.username} em {new Date(comment.date).toLocaleString()}
                                    </small>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* --- FORMULÁRIO CORRIGIDO COM LAYOUT LADO A LADO --- */}
                    <div style={{ padding: '20px', borderTop: '1px solid #e5e7eb' }}>
                        <form
                            onSubmit={(e) => handleCommentSubmit(e, post.id)}
                            className='form-card'
                            style={{
                                margin: 0,
                                padding: 0,
                                display: 'grid', // <<< MUDANÇA 1: Usamos grid em vez de flex
                                gridTemplateColumns: '1fr auto', // <<< MUDANÇA 2: Define as colunas
                                gap: '10px',      // Cria espaço entre as colunas
                                alignItems: 'center' // Alinha verticalmente o input e o botão
                            }}
                        >
                            <input
                                type="text"
                                placeholder="Adicione um comentário..."
                                value={commentText[post.id] || ''}
                                onChange={e => setCommentText(prev => ({ ...prev, [post.id]: e.target.value }))}
                                style={{
                                    // O flex: 1 foi REMOVIDO. O grid agora controla a largura.
                                    width: '100%', // Ajuda o input a entender que deve preencher sua célula do grid
                                    padding: '10px',
                                    border: '1px solid #d1d5db',
                                    borderRadius: '6px',
                                    boxSizing: 'border-box',
                                    fontFamily: 'inherit',
                                    fontSize: '14px'
                                }}
                            />
                            <button
                                type="submit"
                                style={{
                                    // Nenhuma propriedade de flex ou largura extra é necessária aqui
                                    padding: '8px 20px',
                                    backgroundColor: '#3b82f6',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    fontWeight: 'bold',
                                    minWidth: '100px'
                                }}
                            >
                                Comentar
                            </button>


                        </form>
                    </div>
                    {/* --- FIM DO FORMULÁRIO --- */}
                </div>
            ))}
        </div>
    );
};

export default MuralPage;