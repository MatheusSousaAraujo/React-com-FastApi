// src/pages/GroupDetailPage.js
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';

const GroupDetailPage = () => {
  const { groupId } = useParams();
  // >>> Importa a função refreshUser do contexto <<<
  const { isAuthenticated, user, refreshUser } = useAuth();
  const navigate = useNavigate();

  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isMember, setIsMember] = useState(false);
  const [isCreator, setIsCreator] = useState(false);

  const fetchGroupDetails = useCallback(() => {
    setLoading(true);
    setError('');
    api.get(`/groups/${groupId}/details`)
      .then(response => {
        const groupData = response.data;
        setGroup(groupData);

        if (isAuthenticated && user) {
          if (groupData.members && Array.isArray(groupData.members)) {
            const memberCheck = groupData.members.some(member => member.id === user.id);
            setIsMember(memberCheck);
          } else {
            setIsMember(false);
          }
          if (groupData.creator && groupData.creator.id === user.id) {
            setIsCreator(true);
          } else {
            setIsCreator(false);
          }
        } else {
          setIsMember(false);
          setIsCreator(false);
        }
      })
      .catch(err => {
        const errorMessage = err.response?.data?.detail || "Não foi possível carregar os detalhes do grupo.";
        setError(errorMessage);
        console.error("Erro em fetchGroupDetails:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [groupId, isAuthenticated, user]);

  useEffect(() => {
    fetchGroupDetails();
  }, [fetchGroupDetails]);

  const handleJoinGroup = async () => {
    if (!group) return;
    try {
      await api.post(`/groups/${groupId}/join`);
      alert(`Bem-vindo ao fórum ${group.name}!`);
      // >>> ATUALIZA O USUÁRIO GLOBAL <<<
      await refreshUser();
      fetchGroupDetails();
    } catch (err) {
      const errorMessage = err.response?.data?.detail || "Erro ao tentar entrar no fórum.";
      alert(errorMessage);
      console.error("Erro em handleJoinGroup:", err);
    }
  };

  const handleLeaveGroup = async () => {
    if (!group) return;
    try {
      await api.post(`/groups/${groupId}/leave`);
      alert(`Você saiu do fórum ${group.name}.`);
      // >>> ATUALIZA O USUÁRIO GLOBAL <<<
      await refreshUser();
      fetchGroupDetails();
    } catch (err) {
      const errorMessage = err.response?.data?.detail || "Erro ao tentar sair do fórum.";
      alert(errorMessage);
      console.error("Erro em handleLeaveGroup:", err);
    }
  };

  const handleDeleteGroup = async () => {
    if (window.confirm(`ATENÇÃO: Isso excluirá o fórum "${group.name}" e todos os seus posts permanentemente. Deseja continuar?`)) {
        try {
            await api.delete(`/groups/${groupId}`);
            alert(`Fórum "${group.name}" excluído com sucesso.`);
            // >>> ATUALIZA O USUÁRIO GLOBAL ANTES DE NAVEGAR <<<
            await refreshUser();
            navigate('/');
        } catch (err) {
            const errorMessage = err.response?.data?.detail || "Erro ao excluir o fórum.";
            alert(errorMessage);
        }
    }
  };

  // --- ESTILOS ---
  const styles = {
    pageContainer: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: "0, 50px, 50px"
    },
    headerCard: {
      background: 'linear-gradient(135deg,rgb(35, 44, 70) 0%,rgb(92, 116, 153) 100%)',
      color: 'white',
      padding: '30px',
      borderRadius: '12px',
      boxShadow: '0 10px 20px rgba(0, 0, 0, 0.1)',
      marginBottom: '30px',
    },
    groupTitle: {
      margin: 0,
      fontSize: '2.5rem',
      fontWeight: 'bold',
      textShadow: '1px 1px 2px rgba(0,0,0,0.2)',
    },
    groupDescription: {
      margin: '10px 0 0 0',
      fontSize: '1.1rem',
      opacity: 0.9,
    },
    mainContent: {
      display: 'grid',
      gridTemplateColumns: '2fr 1fr',
      gap: '30px',
    },
    column: {
      background: 'white',
      padding: '25px',
      borderRadius: '8px',
      boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
      border: '1px solid rgb(209, 213, 219)',
    },
    columnTitle: {
      margin: '0 0 20px 0',
      color: '#111827',
      borderBottom: '2px solid #e5e7eb',
      paddingBottom: '10px',
    },
    memberList: {
      listStyleType: 'none',
      padding: 0,
      margin: 0,
    },
    memberItem: {
      display: 'flex',
      alignItems: 'center',
      padding: '8px 0',
      borderBottom: '1px solid #f3f4f6',
    },
    memberAvatar: {
      width: '32px',
      height: '32px',
      borderRadius: '50%',
      backgroundColor: '#d1d5db',
      marginRight: '12px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: 'bold',
      color: '#4b5563',
    },
    actionButton: {
      width: '100%',
      padding: '12px',
      border: 'none',
      borderRadius: '6px',
      fontSize: '1rem',
      fontWeight: 'bold',
      cursor: 'pointer',
      transition: 'background-color 0.2s, transform 0.1s',
    },
    joinButton: {
      backgroundColor: '#2563eb',
      color: 'white',
    },
    leaveButton: {
      backgroundColor: '#dc2626',
      color: 'white',
    },
    deleteButton: {
      width: '100%',
      padding: '12px',
      border: 'none',
      borderRadius: '6px',
      fontSize: '1rem',
      fontWeight: 'bold',
      cursor: 'pointer',
      transition: 'background-color 0.2s, transform 0.1s',
      backgroundColor: '#991b1b',
      color: 'white',
      marginTop: '10px',
    }
  };

  // --- RENDERIZAÇÃO ---

  if (loading) return <div style={styles.pageContainer}><p>Carregando...</p></div>;
  if (error) return <div style={styles.pageContainer}><p style={{ color: 'red' }}>{error}</p></div>;
  if (!group) return <div style={styles.pageContainer}><p>Grupo não encontrado.</p></div>;

  return (
    <div style={styles.pageContainer}>
      <header style={styles.headerCard}>
        <h1 style={styles.groupTitle}>{group.name}</h1>
        <p style={styles.groupDescription}>{group.description}</p>
      </header>

      <div style={styles.mainContent}>
        <div style={styles.column}>
          <h2 style={styles.columnTitle}>Discussões</h2>
          {isMember ? (
            <div>
              <p>Bem-vindo! Agora você pode ver e criar posts neste fórum.</p>
              <p>Visite o <Link to="/mural">Meu Feed</Link> para ver todas as atualizações.</p>
            </div>
          ) : (
            <p>Você precisa ser membro deste fórum para ver as discussões.</p>
          )}
        </div>

        <div style={styles.column}>
          <h2 style={styles.columnTitle}>Membros ({group.members?.length || 0})</h2>
          <ul style={styles.memberList}>
            {group.members && group.members.map(member => (
              <li key={member.id} style={styles.memberItem}>
                <div style={styles.memberAvatar}>{member.username.charAt(0).toUpperCase()}</div>
                <span>{member.username}{group.creator && group.creator.id === member.id ? ' (Criador)' : ''}</span>
              </li>
            ))}
          </ul>

          <div style={{ marginTop: '30px' }}>
            {!isAuthenticated && (
              <button onClick={() => navigate('/acesso')} style={{ ...styles.actionButton, ...styles.joinButton }}>
                Faça login para participar
              </button>
            )}
            {isAuthenticated && !isMember && (
              <button onClick={handleJoinGroup} style={{ ...styles.actionButton, ...styles.joinButton }}>
                Entrar no Fórum
              </button>
            )}
            {isAuthenticated && isMember && !isCreator && (
              <button onClick={handleLeaveGroup} style={{ ...styles.actionButton, ...styles.leaveButton }}>
                Sair do Fórum
              </button>
            )}
            {isAuthenticated && isCreator && (
              <button onClick={handleDeleteGroup} style={styles.deleteButton}>
                Excluir Fórum (Admin)
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroupDetailPage;