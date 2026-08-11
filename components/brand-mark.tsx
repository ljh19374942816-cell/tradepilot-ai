export function BrandMark({ light = false }: { light?: boolean }) {
  return <div className="flex items-center gap-2.5" aria-label="TradePilot AI">
    <span className={`grid size-9 place-items-center rounded-[5px] ${light ? "bg-[#d8f06d] text-[#073c2c]" : "bg-[#0b5d43] text-white"}`}>
      <span className="text-lg font-black">T</span>
    </span>
    <span className={`text-[15px] font-black tracking-normal ${light ? "text-white" : "text-[#10221c]"}`}>TRADEPILOT <span className={light ? "text-[#d8f06d]" : "text-[#0b5d43]"}>AI</span></span>
  </div>;
}
