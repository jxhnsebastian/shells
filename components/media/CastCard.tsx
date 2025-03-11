import Image from "next/image"

interface CastCardProps {
  image: string
  name: string
  character: string
}

export function CastCard({ image, name, character }: CastCardProps) {
  return (
    <div className="flex flex-col">
      <div className="rounded-lg overflow-hidden mb-2">
        <Image
          src={image || "/placeholder.svg"}
          alt={name}
          width={180}
          height={270}
          className="object-cover w-full h-full"
        />
      </div>
      <h3 className="font-medium text-white truncate">{name}</h3>
      <p className="text-sm text-gray-400 truncate">{character}</p>
    </div>
  )
}

