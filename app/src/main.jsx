import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'
import { persistStore } from 'redux-persist'
import store from './redux/store.js'
import Layout from './components/layout.jsx'
import App from './routes/index.jsx'
import ErrorPage from './error-page.jsx'
import Login from './routes/login.jsx'
import './index.css'

const router = createBrowserRouter([
  {
    path: '*',
    element: <Layout />,
    errorElement: <ErrorPage />,
    children: [
      {
        path: '',
        element: <App />,
      },
      {
        path: 'login',
        element: <Login />,
      },
      {
        path: '*',
        element: <ErrorPage />,
      },
    ],
  },
])

const persistor = persistStore(store)

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <RouterProvider router={router} />
      </PersistGate>
    </Provider>
  </React.StrictMode>,
)
