import Image from "next/image";
import { Vial, vialLabel } from "./Vial";

type ProductImageProps = {
  imageSrc?: string;
  name: string;
  strength: string;
  priority?: boolean;
  sizes?: string;
};

export function ProductImage({
  imageSrc,
  name,
  strength,
  priority = false,
  sizes = "(max-width: 540px) 100vw, (max-width: 1024px) 33vw, 25vw",
}: ProductImageProps) {
  if (!imageSrc) {
    return <Vial label={vialLabel(name)} />;
  }

  return (
    <Image
      className="product-image"
      src={imageSrc}
      alt={`${name} ${strength}`}
      width={1254}
      height={1254}
      sizes={sizes}
      priority={priority}
    />
  );
}
