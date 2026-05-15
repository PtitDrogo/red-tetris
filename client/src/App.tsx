import { useState } from 'react'


type TestType = {
  age: number;
  name: string;
}


function App() {
  const [count, setCount] = useState(0)
  const [test, setTest] = useState<TestType>({age: 30, name: "Theo"});

  return (
    <>
     <div className="size-48 bg-amber-500">
        <p className="size-10"> welcome to my tetris game, I am {test.name} and I am {test.age} years old</p>
     </div>
    </>
  )
}

export default App
