// src/pages/AcessoPage.js
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';

const AcessoPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const { login } = useAuth();

  // Estados para Login
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Estados para Registro
  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await login(loginUsername, loginPassword);
    } catch (err) {
      setError('Falha no login. Verifique seu usuário e senha.');
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await api.post('/register/', {
        username: regUsername,
        email: regEmail,
        password: regPassword,
      });
      setSuccess('Conta criada com sucesso! Você já pode fazer o login.');
      setIsLogin(true); // Muda para a aba de login
      // Limpa os campos de registro
      setRegUsername('');
      setRegEmail('');
      setRegPassword('');
    } catch (err) {
      setError(err.response?.data?.detail || 'Erro ao criar conta.');
    }
  };

  return (
    <div>
      <div>
        <button onClick={() => setIsLogin(true)} disabled={isLogin}>Login</button>
        <button onClick={() => setIsLogin(false)} disabled={!isLogin}>Registrar</button>
      </div>
      <hr />
      {isLogin ? (
        <form onSubmit={handleLogin}>
          <h2>Login</h2>
          <input type="text" placeholder="Usuário" value={loginUsername} onChange={e => setLoginUsername(e.target.value)} required />
          <input type="password" placeholder="Senha" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} required />
          <button type="submit">Entrar</button>
        </form>
      ) : (
        <form onSubmit={handleRegister}>
          <h2>Criar Conta</h2>
          <input type="text" placeholder="Usuário" value={regUsername} onChange={e => setRegUsername(e.target.value)} required />
          <input type="email" placeholder="Email" value={regEmail} onChange={e => setRegEmail(e.target.value)} required />
          <input type="password" placeholder="Senha" value={regPassword} onChange={e => setRegPassword(e.target.value)} required />
          <button type="submit">Registrar</button>
        </form>
      )}
      {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
      {success && <p style={{ color: 'green', textAlign: 'center' }}>{success}</p>}
    </div>
  );
};

export default AcessoPage;