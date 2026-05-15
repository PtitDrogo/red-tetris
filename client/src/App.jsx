import { useState } from 'react'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
     <div className="size-48 bg-amber-500">
        <ul className="size-10"> welcome to my tetris game</ul>
     </div>
    </>
  )
}

export default App
