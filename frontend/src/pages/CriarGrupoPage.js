// src/pages/CriarGrupoPage.js
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/api';

const CriarGrupoPage = () => {
  // Estados para o formulário
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  
  // Novos estados para a lista de grupos
  const [groups, setGroups] = useState([]);
  const [listLoading, setListLoading] = useState(true);
  const [listError, setListError] = useState('');

  const navigate = useNavigate();

  // Função para buscar a lista de grupos existentes
  const fetchGroups = async () => {
    setListLoading(true);
    try {
      const response = await api.get('/groups/');
      setGroups(response.data);
    } catch (err) {
      setListError('Não foi possível carregar a lista de fóruns.');
    } finally {
      setListLoading(false);
    }
  };

  // useEffect para chamar a função de busca quando o componente montar
  useEffect(() => {
    fetchGroups();
  }, []); // O array vazio garante que rode apenas uma vez

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await api.post('/groups/', { name, description });
      const newGroupId = response.data.id;
      alert('Fórum criado com sucesso!');
      setName('');
      setDescription('');
      fetchGroups(); // Atualiza a lista à direita
      navigate(`/groups/${newGroupId}`);
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 'Erro ao criar o grupo.';
      setError(errorMessage);
    }
  };

  // --- Estilos para o novo layout ---
  const styles = {
    pageContainer: {
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '30px',
        display: 'grid',
        // >>> AQUI ESTÁ A MUDANÇA <<<
        gridTemplateColumns: '2fr 1fr', // Coluna da esquerda 2x maior que a da direita
        gap: '40px',
        alignItems: 'flex-start'
    },
    listContainer: {
        background: '#ffffff',
        padding: '25px',
        borderRadius: '8px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
        border: '1px solid rgb(209, 213, 219)',
    },
    listItem: {
        display: 'flex',
        flexDirection: 'column',
        padding: '10px 0',
        borderBottom: '1px solid #f3f4f6',
    },
    groupLink: {
        textDecoration: 'none',
        color: '#1e3a8a',
        fontWeight: 'bold',
        fontSize: '1.1rem',
    },
    creatorText: {
        fontSize: '0.9em',
        color: '#6b7280',
        margin: '4px 0 0 0'
    }
  };

  return (
    <div style={styles.pageContainer}>
      {/* --- Coluna da Esquerda: Formulário de Criação --- */}
      <div>
        <form onSubmit={handleSubmit} className="form-card">
          <h2 style={{ marginTop: 0 }}>Criar Novo Fórum</h2>
          
          <div style={{ marginBottom: '15px' }}>
            <label htmlFor="group-name" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Nome do Fórum</label>
            <input id="group-name" type="text" placeholder="Ex: Fãs de Ficção Científica" value={name} onChange={e => setName(e.target.value)} required style={{ width: '100%' }} />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label htmlFor="group-description" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Descrição</label>
            <textarea id="group-description" placeholder="Uma breve descrição sobre o que é este fórum." value={description} onChange={e => setDescription(e.target.value)} rows="4" required style={{ width: '100%', resize: 'vertical', fontFamily: 'inherit' }} />
          </div>

          {error && (
              <div style={{ color: '#721c24', backgroundColor: '#f8d7da', border: '1px solid #f5c6cb', padding: '10px', borderRadius: '5px', marginBottom: '15px', textAlign: 'center' }}>{error}</div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" style={{ backgroundColor: '#10b981', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>Criar Fórum</button>
          </div>
        </form>
      </div>

      {/* --- Coluna da Direita: Lista de Fóruns Existentes --- */}
      <div style={styles.listContainer}>
        <h2 style={{ marginTop: 0 }}>Fóruns Existentes</h2>
        {listLoading && <p>Carregando lista...</p>}
        {listError && <p style={{ color: 'red' }}>{listError}</p>}
        {!listLoading && !listError && (
            <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
                {groups.length > 0 ? groups.map(group => (
                    <div key={group.id} style={styles.listItem}>
                        <Link to={`/groups/${group.id}`} style={styles.groupLink}>{group.name}</Link>
                        <p style={styles.creatorText}>Criado por: {group.creator.username}</p>
                    </div>
                )) : <p>Nenhum fórum criado ainda.</p>}
            </div>
        )}
      </div>
    </div>
  );
};

export default CriarGrupoPage;