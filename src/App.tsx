import { useState, useEffect, useRef, useCallback } from "react";
import "./App.css";
import { io, Socket } from "socket.io-client";

interface Card {
  id: string;
  x: number;
  y: number;
}

function App() {
  const socketRef = useRef<Socket | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | number | null>(null);
  const dragState = useRef({
    isDragging: false,
    cardId: "",
    offsetX: 0,
    offsetY: 0,
  });
  const [cards, setCards] = useState<Card[]>([
    { id: "1", x: 100, y: 100 },
    { id: "2", x: 250, y: 100 },
    { id: "3", x: 400, y: 100 },
  ]);
  const fetchCardsState = useCallback(() => {
    socketRef.current?.emit("requestCards");
  }, []);

  useEffect(() => {
    socketRef.current = io("http://4277089-mj96801.twc1.net:3001");
    const handleCardsUpdate = (updatedCards: Card[]) => {
      setCards(updatedCards);
    };

    socketRef.current.on("cardsUpdate", handleCardsUpdate);
    intervalRef.current = setInterval(fetchCardsState, 60000);

    fetchCardsState();

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      socketRef.current?.off("cardsUpdate", handleCardsUpdate);
      socketRef.current?.disconnect();
    };
  }, [fetchCardsState]);

  const handleMouseDown = (e: React.MouseEvent, cardId: string) => {
    const rect = e.currentTarget.getBoundingClientRect();
    dragState.current = {
      isDragging: true,
      cardId,
      offsetX: e.clientX - rect.left,
      offsetY: e.clientY - rect.top,
    };
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!dragState.current.isDragging || !socketRef.current) return;

    const newX = e.clientX - dragState.current.offsetX;
    const newY = e.clientY - dragState.current.offsetY;

    socketRef.current.emit("moveSingleCard", {
      id: dragState.current.cardId,
      x: newX,
      y: newY,
    });

    setCards((prevCards) =>
      prevCards.map((card) =>
        card.id === dragState.current.cardId
          ? { ...card, x: newX, y: newY }
          : card,
      ),
    );
  }, []);

  const handleMouseUp = useCallback(() => {
    dragState.current.isDragging = false;
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
    fetchCardsState();
  }, [handleMouseMove, fetchCardsState]);

  useEffect(() => {
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  return (
    <div className="app">
      {cards.map((card) => (
        <div
          key={card.id}
          className="text-3xl font-bold underline"
          // style={{
          //   left: `${card.x}px`,
          //   top: `${card.y}px`,
          // }}
          onMouseDown={(e) => handleMouseDown(e, card.id)}
        >
          {" "}
          123
          <h1 className="text-3xl font-bold underline">Hello world!</h1>
        </div>
      ))}
    </div>
  );
}

export default App;
