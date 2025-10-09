import { useState, useEffect, useRef, useCallback } from "react";
import "./App.css";
import { io, Socket } from "socket.io-client";
import { Card } from "./components/Card";
import {Cards_container} from "./components/Cards_container"
import type { TypeCard, CardContainer } from './types';

function App() {
  const socketRef = useRef<Socket | null>(null);
  const dragState = useRef({
    isDragging: false,
    cardId: "",
    offsetX: 0,
    offsetY: 0,
  });

  const [dragVisualState, setDragVisualState] = useState({
    isDragging: false,
    cardId: "",
  });

  const [cards, setCards] = useState<TypeCard[]>([]);
  const [cards_Container, setCards_Container] = useState<CardContainer[]>([]);
  const [screenSize, setScreenSize] = useState({ width: 1920, height: 1080 });

  useEffect(() => {
    socketRef.current = io("http://4277089-mj96801.twc1.net:3001");

   const updateScreenSize = () => {
      setScreenSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };
    updateScreenSize(); 
    const handleCardsUpdate = (updatedCards: TypeCard[]) => {
      setCards(updatedCards);
    };
    const handleCardsContainerUpdate = (updatedCards_Container: CardContainer[]) => {
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
    setDragVisualState({
      isDragging: true,
      cardId,
    });
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!dragState.current.isDragging || !socketRef.current) return;

    socketRef.current.emit("moveSingleCard", {
      id: dragState.current.cardId,
      x: e.clientX - dragState.current.offsetX,
      y: e.clientY - dragState.current.offsetY,
    });
  }, []);

  const handleMouseUp = useCallback(() => {
    dragState.current.isDragging = false;

    setDragVisualState({
      isDragging: false,
      cardId: "",
    });
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
  }, [handleMouseMove]);

  useEffect(() => {
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  const createClientGrid = (rows: number, cols: number) => {
    const grid: CardContainer[] = [];
    const cellWidth = screenSize.width / cols;
    const cellHeight = screenSize.height / rows;
    
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        grid.push({
          id: `${row}-${col}`,
          x: col * cellWidth,
          y: row * cellHeight,
          width: cellWidth,
          height: cellHeight
        });
      }
    }
    return grid;
  };
  const displayContainers = cards_Container.length > 0 
    ? cards_Container 
    : createClientGrid(10, 10);
 return (
    <div className="app">
      {cards.map((card) => (
        <Card
          key={card.id}
          card={card}
          onMouseDown={handleMouseDown}
          isDragging={dragVisualState.isDragging}
          isCurrentDragging={dragVisualState.cardId === card.id}
        />
      ))}
         {displayContainers.map((card_Container) => (
         <Cards_container
          key={card_Container.id}
          card_Container={card_Container} 
        />
      ))}
    </div>
  );
}

export default App;
