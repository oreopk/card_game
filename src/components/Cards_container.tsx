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
  return (
    <div
      key={card_Container.id}
      className={` pointer-events-none
        absolute cursor-grab
        border-8
          `}
      style={{
        left: `${card_Container.x}px`,
        top: `${card_Container.y}px`,
        width: `${card_Container.width}px`,
        height: `${card_Container.height}px`,
      }}
    >
    </div>
  );
}
