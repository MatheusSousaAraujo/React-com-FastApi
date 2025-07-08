// src/pages/MuralPage.js

import React, { useState, useEffect } from 'react';
import api from '../api/api';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import editIcon from '../edit.png';

const MuralPage = () => {
    // --- SUA LÓGICA E FUNÇÕES (sem alterações) ---
    const [groupedPosts, setGroupedPosts] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [commentText, setCommentText] = useState({});
    const { user } = useAuth();

    const fetchAndGroupPosts = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await api.get('/posts/');
            const posts = response.data;
            const groups = {};
            posts.forEach(post => {
                if (post.group && post.group.id) {
                    const groupId = post.group.id;
                    if (!groups[groupId]) {
                        groups[groupId] = { ...post.group, posts: [] };
                    }
                    groups[groupId].posts.push(post);
                }
            });
            setGroupedPosts(groups);
        } catch (err) {
            console.error("Erro ao carregar o feed:", err);
            setError('Não foi possível carregar o seu feed.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            fetchAndGroupPosts();
        } else {
            setLoading(false);
        }
    }, [user]);

    const handleCommentSubmit = async (e, postId) => {
        e.preventDefault();
        if (!commentText[postId]?.trim()) return;
        try {
            await api.post(`/posts/${postId}/comments/`, { title: "Comentário", text: commentText[postId] });
            setCommentText(prev => ({ ...prev, [postId]: '' }));
            fetchAndGroupPosts();
        } catch (err) { alert('Erro ao enviar comentário.'); }
    };

    const handleDeletePost = async (postId) => {
        if (window.confirm('Tem certeza que deseja excluir este post?')) {
            try {
                await api.delete(`/posts/${postId}`);
                fetchAndGroupPosts();
            } catch (err) { alert('Erro ao excluir o post.'); }
        }
    };

    const handleDeleteComment = async (commentId) => {
        if (window.confirm('Tem certeza que deseja excluir este comentário?')) {
            try {
                await api.delete(`/comments/${commentId}`);
                fetchAndGroupPosts();
            } catch (err) { alert('Erro ao excluir o comentário.'); }
        }
    };

    const handleLeaveGroup = async (groupId, groupName) => {
        if (window.confirm(`Tem certeza que deseja sair do fórum "${groupName}"?`)) {
            try {
                await api.post(`/groups/${groupId}/leave`);
                alert(`Você saiu do fórum "${groupName}".`);
                setGroupedPosts(currentGroups => {
                    const newGroups = { ...currentGroups };
                    delete newGroups[groupId];
                    return newGroups;
                });
            } catch (err) {
                alert('Erro ao tentar sair do fórum.');
            }
        }
    };

    if (loading) return <div>Carregando seu feed...</div>;
    if (error) return <p style={{ color: 'red' }}>{error}</p>;

    const groupIds = Object.keys(groupedPosts);

    // --- Estilo base para os botões do cabeçalho do grupo ---
    const headerButtonStyle = {
        padding: '8px 16px',
        borderRadius: '6px',
        cursor: 'pointer',
        fontWeight: 'bold',
        fontSize: '14px',
        border: '1px solid transparent',
        minWidth: '110px', // <<< A SOLUÇÃO: Garante uma largura mínima para ambos
        textAlign: 'center' // Garante que o texto fique centralizado
    };

    return (
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <h1 style={{ color: '#111827' }}>Meu Feed</h1>
            
            {groupIds.length > 0 ? (
                groupIds.map(groupId => {
                    const group = groupedPosts[groupId];
                    return (
                        <div key={group.id} style={{ 
                            border: '1px solid #d1d5db', borderRadius: '10px', 
                            marginBottom: '40px', background: '#f9fafb', overflow: 'hidden'
                        }}>
                            <div style={{ 
                                display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
                                padding: '20px', borderBottom: '1px solid #e5e7eb', background: 'white' 
                            }}>
                                <div>
                                    <Link to={`/groups/${group.id}`} style={{textDecoration: 'none'}}>
                                        <h2 style={{ margin: 0, color: '#1e3a8a' }}>Fórum: {group.name}</h2>
                                    </Link>
                                    <p style={{ margin: '5px 0 0 0', color: '#4b5563' }}>{group.description}</p>
                                </div>
                                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexShrink: 0, marginLeft: '20px' }}>
                                    <Link 
                                        to="/nova-mensagem" 
                                        state={{ preselectedGroup: { id: group.id, name: group.name } }}
                                        style={{ textDecoration: 'none' }}
                                    >
                                        <button style={{
                                            ...headerButtonStyle, // Aplica o estilo base
                                            backgroundColor: '#dbeafe', 
                                            color: '#1e40af',           
                                            borderColor: '#bfdbfe',
                                        }}>
                                            Criar Post
                                        </button>
                                    </Link>
                                    <button 
                                        onClick={() => handleLeaveGroup(group.id, group.name)} 
                                        style={{
                                            ...headerButtonStyle, // Aplica o estilo base
                                            backgroundColor: '#fee2e2', 
                                            color: '#b91c1c',           
                                            borderColor: '#fecaca',
                                        }}>
                                        Sair
                                    </button>
                                </div>
                            </div>
                            
                            <div style={{ padding: '20px' }}>
                                {group.posts.map(post => (
                                    <div key={post.id} style={{
                                        border: '1px solid #e5e7eb', borderRadius: '8px', marginBottom: '20px',
                                        background: '#ffffff', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05)'
                                    }}>
                                        <div style={{ padding: '20px' }}>
                                            <div>
                                                <h3 style={{ margin: 0, color: '#1f2937' }}>{post.title}</h3>
                                                <small style={{ display: 'block', marginTop: '8px', color: '#6b7280' }}>
                                                    por: {post.author.username} em {new Date(post.date).toLocaleString()}
                                                </small>
                                            </div>
                                            <p style={{ marginTop: '15px', color: '#374151', lineHeight: '1.6' }}>{post.text}</p>
                                            {user && user.id === post.author.id && (
                                                <div style={{ display: 'flex', marginTop: '20px', justifyContent: 'flex-end', gap: '10px' }}>
                                                    <Link to={`/editar-post/${post.id}`}>
                                                        <button style={{ backgroundColor: '#f59e0b', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', padding: '8px', display: 'flex', alignItems: 'center' }}>
                                                            <img src={editIcon} alt="Editar" style={{ width: '16px', height: '16px' }} />
                                                        </button>
                                                    </Link>
                                                    <button onClick={() => handleDeletePost(post.id)} style={{ backgroundColor: '#ef4444', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Excluir</button>
                                                </div>
                                            )}
                                        </div>
                                        {post.comments.length > 0 && (
                                            <div style={{ backgroundColor: '#f9fafb', borderTop: '1px solid #e5e7eb', padding: '20px' }}>
                                                <h4 style={{ marginTop: 0, marginBottom: '15px', color: '#4b5563' }}>Comentários</h4>
                                                {post.comments.map(comment => (
                                                    <div key={comment.id} style={{ borderLeft: '3px solid #d1d5db', paddingLeft: '15px', marginBottom: '15px' }}>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px' }}>
                                                            <p style={{ margin: 0, flex: '1 1 auto', wordBreak: 'break-word', color: '#111827' }}>{comment.text}</p>
                                                            {user && user.id === comment.commenter.id && (
                                                                <button onClick={() => handleDeleteComment(comment.id)} style={{ backgroundColor: '#EF4444', color: 'white', border: 'none', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0, userSelect: 'none', fontWeight: 'bold' }}>X</button>
                                                            )}
                                                        </div>
                                                        <small style={{ color: '#6b7280' }}>por: {comment.commenter.username} em {new Date(comment.date).toLocaleString()}</small>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                        <div style={{ padding: '20px', borderTop: '1px solid #e5e7eb' }}>
                                            <form onSubmit={(e) => handleCommentSubmit(e, post.id)} style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '10px', alignItems: 'center' }}>
                                                <input type="text" placeholder="Adicione um comentário..." value={commentText[post.id] || ''} onChange={e => setCommentText(prev => ({ ...prev, [post.id]: e.target.value }))} style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px', boxSizing: 'border-box', fontFamily: 'inherit', fontSize: '14px' }} />
                                                <button type="submit" style={{ padding: '8px 20px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Comentar</button>
                                            </form>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })
            ) : (
                <div style={{ textAlign: 'center', padding: '40px', background: 'white', borderRadius: '8px' }}>
                    <h2>Seu feed está vazio!</h2>
                    <p>Você ainda não participa de nenhum fórum ou não há posts nos fóruns que você segue.</p>
                    <Link to="/">
                        <button>Explorar Fóruns</button>
                    </Link>
                </div>
            )}
        </div>
    );
};

export default MuralPage;