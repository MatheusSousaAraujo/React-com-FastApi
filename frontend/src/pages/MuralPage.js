// src/pages/MuralPage.js

import React, { useState, useEffect } from 'react';
import api from '../api/api';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import editIcon from '../edit.png'; // Certifique-se que este ícone existe na pasta src

const MuralPage = () => {
    const [groupedPosts, setGroupedPosts] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [commentText, setCommentText] = useState({});
    const { user } = useAuth();

    // >>> A ÚNICA ALTERAÇÃO LÓGICA ESTÁ AQUI DENTRO <<<
    const fetchAndGroupPosts = async () => {
        // Verifica se o usuário e seus grupos já foram carregados
        if (!user || !user.groups) {
            setLoading(false);
            return;
        }

        setLoading(true);
        setError('');
        try {
            // Passo 1: Inicia o objeto com TODOS os grupos do usuário, garantindo que todos apareçam
            const initialGroups = {};
            user.groups.forEach(group => {
                initialGroups[group.id] = {
                    ...group, // Copia os dados do grupo (id, name, description)
                    posts: []  // Inicia com uma lista de posts vazia
                };
            });

            // Passo 2: Busca os posts do feed (que só virão dos grupos do usuário)
            const response = await api.get('/posts/');
            const posts = response.data;

            // Passo 3: Preenche os posts nos grupos correspondentes que já estão no objeto
            posts.forEach(post => {
                if (post.group && post.group.id && initialGroups[post.group.id]) {
                    initialGroups[post.group.id].posts.push(post);
                }
            });
            
            setGroupedPosts(initialGroups);
        } catch (err) {
            console.error("Erro ao carregar o feed:", err);
            setError('Não foi possível carregar o seu feed.');
        } finally {
            setLoading(false);
        }
    };

    // O resto das suas funções permanece exatamente igual
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

    // >>> PEQUENA ALTERAÇÃO AQUI PARA USAR A FONTE DE DADOS CORRETA <<<
    const userGroups = user?.groups || [];

    const headerButtonStyle = {
        padding: '8px 16px',
        borderRadius: '6px',
        cursor: 'pointer',
        fontWeight: 'bold',
        fontSize: '14px',
        border: '1px solid transparent',
        minWidth: '110px',
        textAlign: 'center'
    };

    return (
        <div style={{ maxWidth: '1200px', margin: '0px', padding: "50px", paddingTop: "0px", marginTop:"0px" }}>
            
            <h1 style={{ color: '#111827', marginTop:'10px' }}>Meu Feed</h1>

            {/* >>> ALTERAÇÃO AQUI: Itera sobre userGroups para garantir que todos apareçam <<< */}
            {userGroups.length > 0 ? (
                userGroups.map(group => {
                    // Pega os dados completos do grupo (com posts) do nosso estado
                    const groupData = groupedPosts[group.id];
                    // Medida de segurança: se os dados ainda não foram processados, não renderiza
                    if (!groupData) return null;

                    return (
                        <div key={groupData.id} style={{
                            border: '1px solid #d1d5db',
                            borderRadius: '10px',
                            marginBottom: '40px',
                            background: '#f9fafb',
                            overflow: 'hidden'
                        }}>
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '20px',
                                borderBottom: '1px solid #e5e7eb',
                                background: 'white'
                            }}>
                                <div>
                                    <Link to={`/groups/${groupData.id}`} style={{ textDecoration: 'none' }}>
                                        <h2 style={{ margin: 0, color: '#1e3a8a' }}>Fórum: {groupData.name}</h2>
                                    </Link>
                                    <p style={{ margin: '5px 0 0 0', color: '#4b5563' }}>{groupData.description}</p>
                                </div>
                                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexShrink: 0, marginLeft: '20px' }}>
                                    <Link
                                        to="/nova-mensagem"
                                        state={{ preselectedGroup: { id: groupData.id, name: groupData.name } }}
                                        style={{ textDecoration: 'none' }}
                                    >
                                        <button style={{
                                            ...headerButtonStyle,
                                            backgroundColor: '#3b82f6',
                                            color: 'white',
                                            border: 'none',
                                        }}>
                                            Criar Post
                                        </button>
                                    </Link>
                                    <button
                                        onClick={() => handleLeaveGroup(groupData.id, groupData.name)}
                                        style={{
                                            ...headerButtonStyle,
                                            backgroundColor: '#E53E3E',
                                            color: 'white',
                                            border: 'none',
                                        }}>
                                        Sair
                                    </button>
                                </div>
                            </div>

                            <div style={{ padding: '20px' }}>
                                {/* >>> LÓGICA ATUALIZADA PARA LIDAR COM GRUPOS SEM POSTS <<< */}
                                {groupData.posts && groupData.posts.length > 0 ? (
                                    groupData.posts.map(post => (
                                        <div key={post.id} style={{
                                            border: '1px solid #e5e7eb',
                                            borderRadius: '8px',
                                            marginBottom: '20px',
                                            background: '#ffffff',
                                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05)'
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
                                                        <button onClick={() => handleDeletePost(post.id)} style={{ backgroundColor: '#E53E3E', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Excluir</button>
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
                                                                    <button onClick={() => handleDeleteComment(comment.id)} style={{ backgroundColor: '#EF4444', color: 'white', border: 'none', borderRadius: '15%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0, userSelect: 'none', fontWeight: 'bold' }}>X</button>
                                                                )}
                                                            </div>
                                                            <small style={{ color: '#6b7280' }}>por: {comment.commenter.username} em {new Date(comment.date).toLocaleString()}</small>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                            <div style={{ padding: '0px', borderTop: '1px solid #e5e7eb' }}>
                                                <form
                                                    onSubmit={(e) => handleCommentSubmit(e, post.id)}
                                                    style={{
                                                        display: 'grid',
                                                        gridTemplateColumns: '1fr auto',
                                                        gap: '10px',
                                                        alignItems: 'center',
                                                        padding: '5px',
                                                        margin: '5px',
                                                        maxWidth: '1200px'
                                                    }}
                                                >
                                                    <input
                                                        type="text"
                                                        placeholder="Adicione um comentário..."
                                                        value={commentText[post.id] || ''}
                                                        onChange={e => setCommentText(prev => ({ ...prev, [post.id]: e.target.value }))}
                                                        style={{
                                                            width: '100%', padding: '10px', border: '1px solid #d1d5db',
                                                            borderRadius: '6px', boxSizing: 'border-box',
                                                            fontFamily: 'inherit', fontSize: '14px'
                                                        }}
                                                    />
                                                    <button
                                                        type="submit"
                                                        style={{
                                                            padding: '10px 20px', backgroundColor: '#3b82f6',
                                                            color: 'white', border: 'none', borderRadius: '6px',
                                                            cursor: 'pointer', fontWeight: 'bold', maxWidth: '200px'
                                                        }}>
                                                        Comentar
                                                    </button>
                                                </form>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p style={{ textAlign: 'center', color: '#6b7280', padding: '20px 0' }}>Nenhum post neste fórum ainda. Seja o primeiro!</p>
                                )}
                            </div>
                        </div>
                    );
                })
            ) : (
                <div style={{ textAlign: 'center', padding: '40px', background: 'white', borderRadius: '8px' }}>
                    <h2>Seu feed está vazio!</h2>
                    <p>Você ainda não participa de nenhum fórum.</p>
                    <Link to="/">
                        <button>Explorar Fóruns</button>
                    </Link>
                </div>
            )}
        </div>
    );
};

export default MuralPage;