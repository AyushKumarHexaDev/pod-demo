import React from 'react';
import { createRoot } from 'react-dom/client';
import '@livekit/components-styles';
import './styles.css';
import App from './App.jsx';
import { configMissing } from './supabaseClient.js';

createRoot(document.getElementById('root')).render(
  configMissing ? (
    <main className="center">
      <div className="card narrow">
        <h1>Setup needed</h1>
        <p className="muted">
          The Supabase keys are missing. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY as repository
          secrets, then run the deploy again.
        </p>
      </div>
    </main>
  ) : (
    <App />
  )
);
