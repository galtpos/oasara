import React from 'react';
import { Link } from 'react-router-dom';
import LoginForm from '../components/Auth/LoginForm';

const Login: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-sage-50 via-sage-100/30 to-sage-50 flex items-center justify-center px-6 py-12 relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-10 w-72 h-72 bg-gold-500 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-gold-400 rounded-full blur-3xl"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/">
            <h1 className="font-display text-4xl bg-gradient-to-r from-gold-500 via-gold-600 to-ocean-600 bg-clip-text text-transparent tracking-tight">
              OASARA
            </h1>
          </Link>
        </div>

        <LoginForm />
      </div>
    </div>
  );
};

export default Login;
