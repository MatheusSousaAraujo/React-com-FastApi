// src/pages/AcessoPage.js
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';

const AcessoPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const { login } = useAuth();

  // Estados dos formulários
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Estados para feedback ao usuário
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await login(username, password);
    } catch (err) {
      setError('Falha no login. Verifique seu usuário e senha.');
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await api.post('/register/', { username, email, password });
      setSuccess('Conta criada com sucesso! Você já pode fazer o login.');
      setIsLogin(true); // Muda para a tela de login
      // Limpa os campos para o próximo uso
      clearFormAndErrors();
    } catch (err) {
      setError(err.response?.data?.detail || 'Erro ao criar conta.');
    }
  };

  const clearFormAndErrors = () => {
    setUsername('');
    setEmail('');
    setPassword('');
    setError('');
    setSuccess('');
  };

  // Função para alternar entre os formulários
  const toggleForm = () => {
    setIsLogin(!isLogin);
    clearFormAndErrors();
  };

  // Estilos (inspirados no seu exemplo)
  const styles = {
    container: {
      fontFamily: 'Arial, sans-serif',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      backgroundColor: '#f0f2f5',
      padding:"40px"
    },
    formContainer: {
      backgroundColor: '#ffffff',
      padding: '30px 40px',
      borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      width: '100%',
      maxWidth: '450px',
      boxSizing: 'border-box'
    },
    header: {
      textAlign: 'center',
      color: '#1c1e21',
      marginBottom: '25px',
      fontSize: '1.8em',
      fontWeight: 600,
    },
    input: {
      width: '100%',
      padding: '12px 15px',
      border: '1px solid #ccd0d5',
      borderRadius: '5px',
      fontSize: '1em',
      boxSizing: 'border-box',
      marginBottom: '20px',
    },
    button: {
      width: '100%',
      padding: '12px 15px',
      backgroundColor: '#1877f2',
      color: 'white',
      border: 'none',
      borderRadius: '5px',
      cursor: 'pointer',
      fontSize: '1.1em',
      fontWeight: 'bold',
      marginTop: '10px',
    },
    message: {
      padding: '10px',
      borderRadius: '4px',
      marginBottom: '15px',
      fontSize: '0.95em',
      textAlign: 'center',
    },
    errorMessage: {
      color: '#fa383e',
      backgroundColor: '#ffebe6',
      border: '1px solid #ffc4c6',
    },
    successMessage: {
      color: '#155724',
      backgroundColor: '#d4edda',
      border: '1px solid #c3e6cb',
    },
    toggleLinkContainer: {
      marginTop: '20px',
      textAlign: 'center',
      fontSize: '0.9em',
      color: '#4b4f56',
    },
    toggleLink: {
      color: '#1877f2',
      textDecoration: 'none',
      fontWeight: 'bold',
      cursor: 'pointer',
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.formContainer}>
        {/* O formulário exibido depende do estado 'isLogin' */}
        {isLogin ? (
          // --- FORMULÁRIO DE LOGIN ---
          <form onSubmit={handleLogin}>
            <h2 style={styles.header}>Entrar na Sua Conta</h2>
            {error && <p style={{ ...styles.message, ...styles.errorMessage }}>{error}</p>}
            {success && <p style={{ ...styles.message, ...styles.successMessage }}>{success}</p>}
            
            <input
              type="text"
              placeholder="Nome de Usuário"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={styles.input}
              required
            />
            <input
              type="password"
              placeholder="Senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
              required
            />
            <button type="submit" style={styles.button}>
              Entrar
            </button>
            <p style={styles.toggleLinkContainer}>
              Não tem conta?{' '}
              <span onClick={toggleForm} style={styles.toggleLink}>
                Cadastre-se
              </span>
            </p>
          </form>
        ) : (
          // --- FORMULÁRIO DE REGISTRO ---
          <form onSubmit={handleRegister}>
            <h2 style={styles.header}>Criar Nova Conta</h2>
            {error && <p style={{ ...styles.message, ...styles.errorMessage }}>{error}</p>}

            <input
              type="text"
              placeholder="Nome de Usuário"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={styles.input}
              required
            />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={styles.input}
              required
            />
            <input
              type="password"
              placeholder="Senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
              required
            />
            <button type="submit" style={styles.button}>
              Registrar
            </button>
            <p style={styles.toggleLinkContainer}>
              Já tem uma conta?{' '}
              <span onClick={toggleForm} style={styles.toggleLink}>
                Faça login
              </span>
            </p>
          </form>
        )}
      </div>
    </div>
  );
};

export default AcessoPage;