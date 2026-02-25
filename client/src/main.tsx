import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from 'react-hot-toast';
import { store, persistor } from '@/app/store';
import AppRouter from '@/router';
import Spinner from '@/components/ui/Spinner';
import '@/styles/globals.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={store}>
      <PersistGate loading={<Spinner fullScreen />} persistor={persistor}>
        <HelmetProvider>
          <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
          <AppRouter />
        </HelmetProvider>
      </PersistGate>
    </Provider>
  </React.StrictMode>
);