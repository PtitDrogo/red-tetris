import { useState } from "react";
import { io } from "socket.io-client";

type TestType = {
    age: number;
    name: string;
};

function App() {
    const [count, setCount] = useState(0);
    const [test, setTest] = useState<TestType>({ age: 30, name: "Theo" });
    const socket = io("http://localhost:3000");

    socket.on("connect", () => {
        console.log("Connected to backend with ID:", socket.id);
    });

    return (
        <>
            <div className="size-48 bg-amber-500">
                <p className="size-10">
                    {" "}
                    welcome to my tetris game, I am {test.name} and I am{" "}
                    {test.age} years old
                </p>
            </div>
        </>
    );
}

export default App;
