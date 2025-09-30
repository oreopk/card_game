import React from 'react'

type Cards_container_props = {
    card_Container:{
        id: string;
         x: number;
         y: number;
    }
}

export function Cards_container({card_Container }: Cards_container_props) {
  return (
    <div
      key={card_Container.id}
      className={`
        absolute cursor-grab
        w-[200px] h-[300px]
        border-8
          `}
      style={{
        left: `${card_Container.x}px`,
        top: `${card_Container.y}px`,
      }}
    >
    </div>
  );
}
