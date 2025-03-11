import type React from "react";
interface MovieMetadataItemProps {
  label: string;
  value: string | React.ReactNode;
}

export function MovieMetadataItem({ label, value }: MovieMetadataItemProps) {
  return (
    <div className="mb-4">
      <h3 className="text-gray-400 text-sm mb-1">{label}</h3>
      <div className="text-white">{value}</div>
    </div>
  );
}
