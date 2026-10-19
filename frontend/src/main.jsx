import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import 'bootstrap/dist/css/bootstrap.min.css'
import { AuthProvider } from './context/AuthContext.jsx'
import { CartProvider } from './context/CarritoContext.jsx'




ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>

     <CartProvider>
        <App />
     </CartProvider>

    </AuthProvider>

  </React.StrictMode>,
)
