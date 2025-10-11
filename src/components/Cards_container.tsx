import React from 'react'

type Cards_container_props = {
    card_Container:{
        id: string;
         x: number;
         y: number;
         width: number;
         height: number;
    }
}

export function Cards_container({card_Container }: Cards_container_props) {
  const baseWidth = 70;
  const baseHeight = 140;
  
  return (
    <div
      key={card_Container.id}
      className={`pointer-events-none absolute cursor-grab border-2 rounded-xl`}
      style={{
        left: `${card_Container.x * baseWidth}px`,
        top: `${card_Container.y * baseHeight}px`,
        width: `${baseWidth}px`,
        height: `${baseHeight}px`
      }}
    >
    </div>
  );
}