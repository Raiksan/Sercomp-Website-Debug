import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { DebugProvider } from './debug/DebugContext.jsx'
import { MarketProvider } from './context/MarketContext.jsx'
import './debug/debugGlobal.css'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <DebugProvider>
    <MarketProvider>
      <App />
    </MarketProvider>
  </DebugProvider>,
)
