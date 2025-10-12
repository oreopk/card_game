import { useState, useEffect, useRef, useCallback } from "react";
import "./App.css";
import { io, Socket } from "socket.io-client";
import { Card } from "./components/Card";
import {Cards_container} from "./components/Cards_container"
import type { TypeCard, CardContainer } from './types';

function App() {
  const [screenSize, setScreenSize] = useState({ width: 1920, height: 1080 });
  useEffect(() => {
   const updateScreenSize = () => {
      setScreenSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };
    updateScreenSize(); 
  }, []);

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

  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const [cards, setCards] = useState<TypeCard[]>([]);
  const [cards_Container, setCards_Container] = useState<CardContainer[]>([]);


  useEffect(() => {
    socketRef.current = io("http://4277089-mj96801.twc1.net:3001");
  
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

  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    
    const zoomSpeed = 0.001;
    const newScale = scale - e.deltaY * zoomSpeed;
    const clampedScale = Math.min(Math.max(0.1, newScale), 3);
    
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    const newX = mouseX - (mouseX - position.x) * newScale / scale;
    const newY = mouseY - (mouseY - position.y) * newScale / scale;

    setScale(newScale);
    setPosition({ x: newX, y: newY });
  }, [scale, position]);


  
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    
    container.addEventListener('wheel', handleWheel, { passive: false });
    
    return () => {
      container.removeEventListener('wheel', handleWheel);
    };
  }, [handleWheel]);

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


 return (
      <div 
      className="app relative w-full h-screen overflow-hidden"
      ref={containerRef}
    >
        <div
        className="absolute w-full h-full"
        style={{
          transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
          transformOrigin: '0 0',
          transition: 'transform 0.1s ease-out'
        }}
      >
      {cards.map((card) => (
        <Card
          key={card.id}
          card={card}
          onMouseDown={handleMouseDown}
          isDragging={dragVisualState.isDragging}
          isCurrentDragging={dragVisualState.cardId === card.id}
        />
      ))}
        <div className="absolute left-1/2 top-1/2">
         {cards_Container.map((card_Container) => (
          <Cards_container
            key={card_Container.id}
            card_Container={card_Container} 
          />
        ))}
      </div>
    </div>
        <div className="fixed top-4 right-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded">
        Zoom: {Math.round(scale * 100)}%
      </div>
    </div>
  );
}

export default App;
