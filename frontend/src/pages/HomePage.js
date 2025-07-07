// src/pages/HomePage.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/api';

const HomePage = () => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Busca a lista de todos os grupos da API quando o componente é montado.
    // Esta é a rota pública que criamos.
    api.get('/groups/')
      .then(response => {
        setGroups(response.data);
      })
      .catch(err => {
        console.error("Erro ao buscar grupos:", err);
        setError('Não foi possível carregar os fóruns. Tente novamente mais tarde.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, []); // O array vazio [] garante que isso rode apenas uma vez.

  // --- Estilos para os cartões dos grupos ---
  const styles = {
    container: {
      maxWidth: '900px',
      margin: '0 auto',
      textAlign: 'center',
    },
    header: {
      marginBottom: '30px',
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', // Grid responsivo
      gap: '20px',
    },
    card: {
      background: '#ffffff',
      border: '1px solid #e5e7eb',
      borderRadius: '8px',
      padding: '20px',
      textAlign: 'left',
      textDecoration: 'none',
      color: 'inherit',
      display: 'block',
      boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
      transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    },
    cardHover: { // Estilo para quando o mouse passa por cima
      transform: 'translateY(-5px)',
      boxShadow: '0 8px 15px rgba(0,0,0,0.1)',
    },
    cardTitle: {
      margin: 0,
      color: '#1e3a8a', // Um azul mais escuro
    },
    cardDescription: {
      color: '#4b5563',
      minHeight: '40px', // Garante uma altura mínima para alinhamento
    },
    cardFooter: {
      marginTop: '15px',
      fontSize: '0.9em',
      color: '#6b7280',
    }
  };

  // Componente interno para o cartão, para lidar com o estado de hover
  const GroupCard = ({ group }) => {
    const [hover, setHover] = useState(false);
    return (
      <Link 
        to={`/groups/${group.id}`} 
        style={{ ...styles.card, ...(hover ? styles.cardHover : {}) }}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
      >
        <h3 style={styles.cardTitle}>{group.name}</h3>
        <p style={styles.cardDescription}>{group.description}</p>
        <div style={styles.cardFooter}>
          <small>Criado por: {group.creator.username}</small>
        </div>
      </Link>
    );
  };
  
  // --- Renderização Principal ---

  if (loading) {
    return <div style={styles.container}><p>Carregando fóruns...</p></div>;
  }

  if (error) {
    return <div style={styles.container}><p style={{ color: 'red' }}>{error}</p></div>;
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1>Explore Nossos Fóruns</h1>
        <p>Clique em um fórum para ver os membros e as discussões públicas. Faça login para participar!</p>
      </div>

      <div style={styles.grid}>
        {groups.length > 0 ? (
          groups.map(group => (
            <GroupCard key={group.id} group={group} />
          ))
        ) : (
          <p>Nenhum fórum foi criado ainda. Seja o primeiro! (após fazer login)</p>
        )}
      </div>
    </div>
  );
};

export default HomePage;