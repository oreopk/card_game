import { useState, useEffect, useRef, useCallback } from "react";
import "./App.css";
import { io, Socket } from "socket.io-client";
import { Card } from "./components/Card";
import {Cards_container} from "./components/Cards_container"

type CardType = "nishchiy" | "bogach";

interface Card {
  id: string;
  x: number;
  y: number;
  type: CardType;
}

interface Card_Container {
  id: string;
  x: number;
  y: number;
}


function App() {
  const socketRef = useRef<Socket | null>(null);
  const dragState = useRef({
    isDragging: false,
    cardId: "",
    offsetX: 0,
    offsetY: 0,
  });
  const [cards, setCards] = useState<Card[]>([]);
  const [cards_Container, setCards_Container] = useState<Card_Container[]>([]);

  useEffect(() => {
    socketRef.current = io("http://4277089-mj96801.twc1.net:3001");
    const handleCardsUpdate = (updatedCards: Card[]) => {
      setCards(updatedCards);
    };
    const handleCardsContainerUpdate = (updatedCards_Container: Card_Container[]) => {
      setCards_Container(updatedCards_Container);
    };

    socketRef.current.on("cardsContainerUpdate", handleCardsContainerUpdate);
    socketRef.current.on("cardsUpdate", handleCardsUpdate);
    return () => {

      socketRef.current?.off("cardsUpdate", handleCardsUpdate);
      socketRef.current?.disconnect();
    };
  }, []);

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
  }, []);

  const handleMouseUp = useCallback(() => {
    dragState.current.isDragging = false;
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
  }, [handleMouseMove]);

  useEffect(() => {
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

 return (
    <div className="app">
      {cards.map((card) => (
        <Card
          key={card.id}
          card={card}
          onMouseDown={handleMouseDown}
          isDragging={dragState.current.isDragging}
          isCurrentDragging={dragState.current.cardId === card.id}
        />
      ))}
         {cards_Container.map((card_Container) => (
         <Cards_container
          key={card_Container.id}
          card_Container={card_Container} 
        />
      ))}
    </div>
  );
}

export default App;
