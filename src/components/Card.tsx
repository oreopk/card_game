type CardType = "nishchiy" | "bogach";

interface CardProps {
  card: {
    id: string;
    x: number;
    y: number;
    type: CardType;
  };
  onMouseDown: (e: React.MouseEvent, cardId: string) => void;
  isDragging: boolean;
  isCurrentDragging: boolean;
}

const CARD_IMG: Record<CardType, string> = {
  nishchiy: "/images/nishchiy.png",
  bogach: "/images/bogach.png",
};

export function Card({ card, onMouseDown, isDragging, isCurrentDragging }: CardProps) {
  return (
    <div
      key={card.id}
      className={`
        absolute cursor-grab
        w-[200px] h-[300px]
        transition-transform duration-200 ease-[ease]
        select-none user-drag-none
        ${isDragging && isCurrentDragging 
          ? "cursor-grabbing transition-none" 
          : ""}
      `}
      style={{
        left: `${card.x}px`,
        top: `${card.y}px`,
      }}
      onMouseDown={(e) => onMouseDown(e, card.id)}
    > 
      <img
        src={CARD_IMG[card.type]}
        alt={card.type}
        draggable={false}
        className="select-none user-drag-none"
        style={{ width: "100%", height: "100%", objectFit: "cover", pointerEvents: "none" }}
      />
    </div>
  );
}