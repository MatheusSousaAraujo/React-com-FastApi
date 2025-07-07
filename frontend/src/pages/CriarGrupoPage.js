// src/pages/CriarGrupoPage.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';

const CriarGrupoPage = () => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState(''); // Estado para guardar a MENSAGEM de erro (string)
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); // Limpa erros anteriores antes de uma nova tentativa

    try {
      // Tenta fazer a chamada para criar o grupo
      const response = await api.post('/groups/', { name, description });
      
      // Se a chamada for bem-sucedida, navega para a página do novo grupo
      const newGroupId = response.data.id;
      navigate(`/groups/${newGroupId}`);
      
    } catch (err) {
      // Bloco de tratamento de erros robusto
      console.error("DEBUG: Objeto de erro recebido da API:", err);

      if (err.response && err.response.data) {
        const errorData = err.response.data;

        // Caso 1: Erro de negócio definido no FastAPI (ex: nome já existe)
        // A API envia: { "detail": "Mensagem de erro" }
        if (typeof errorData.detail === 'string') {
          setError(errorData.detail);
        } 
        // Caso 2: Erro de validação do Pydantic (ex: campo faltando)
        // A API envia: { "detail": [ { "loc": ..., "msg": ..., "type": ... } ] }
        else if (Array.isArray(errorData.detail)) {
          // Pega a mensagem do primeiro erro na lista e a formata para ser legível
          const firstError = errorData.detail[0];
          // O `loc` é um array, `loc[1]` geralmente é o nome do campo.
          const fieldName = firstError.loc[1] || 'campo';
          const errorMessage = `Erro no campo '${fieldName}': ${firstError.msg}`;
          setError(errorMessage);
        } 
        // Caso 3: Um erro inesperado no servidor
        else {
          setError('Ocorreu um erro desconhecido no servidor.');
        }
      } else {
        // Caso 4: Erro de rede (API offline, sem internet, etc.)
        setError('Não foi possível conectar ao servidor. Verifique sua conexão e se a API está rodando.');
      }
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: "30px" }}>
      <form onSubmit={handleSubmit} className="form-card">
        <h2 style={{ marginTop: 0 }}>Criar Novo Fórum</h2>
        
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="group-name" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Nome do Fórum
          </label>
          <input 
            id="group-name"
            type="text" 
            placeholder="Ex: Fãs de Ficção Científica" 
            value={name} 
            onChange={e => setName(e.target.value)} 
            required 
            style={{ width: '100%' }}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label htmlFor="group-description" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Descrição
          </label>
          <textarea 
            id="group-description"
            placeholder="Uma breve descrição sobre o que é este fórum." 
            value={description} 
            onChange={e => setDescription(e.target.value)} 
            rows="4"
            required 
            style={{ 
              width: '100%', 
              resize: 'vertical',
              fontFamily: 'inherit'
            }} 
          />
        </div>

        {/* Exibe a mensagem de erro (agora sempre uma string) */}
        {error && (
            <div style={{
                color: '#721c24',
                backgroundColor: '#f8d7da',
                border: '1px solid #f5c6cb',
                padding: '10px',
                borderRadius: '5px',
                marginBottom: '15px',
                textAlign: 'center'
            }}>
                {error}
            </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button 
            type="submit" 
            style={{ 
              backgroundColor: '#10b981',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '6px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            Criar Fórum
          </button>
        </div>
      </form>
    </div>
  );
};

export default CriarGrupoPage;