import './App.css'
import MainComp from './components/MainComp';
import { VexFlowProvider } from './hooks/useVexFlow';

function App() {

  return (
    <>
      <VexFlowProvider>
        <MainComp />
      </VexFlowProvider>
    </>
  )
}

export default App
