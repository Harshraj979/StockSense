// Auth module router — decides which view is visible
// No third-party routing needed at this level; keeps it simple

import { useState } from 'react';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import ForgotPasswordFlow from './ForgotPasswordFlow';

type View = 'login' | 'register' | 'forgot';

export default function AuthPage() {
  const [view, setView] = useState<View>('login');

  if (view === 'register') {
    return (
      <RegisterForm
        onSwitchToLogin={() => setView('login')}
        onRegistered={() => setView('login')}
      />
    );
  }

  if (view === 'forgot') {
    return (
      <ForgotPasswordFlow
        onSwitchToLogin={() => setView('login')}
      />
    );
  }

  return (
    <LoginForm
      onSwitchToRegister={() => setView('register')}
      onSwitchToForgot={() => setView('forgot')}
    />
  );
}
