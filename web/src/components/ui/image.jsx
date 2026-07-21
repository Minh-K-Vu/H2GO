import NextImage from "next/image";

export function Image({
  src,
  alt = "",
  className,
  fittingType = "cover",
  ...props
}) {
  const objectFit = fittingType === "fill" ? "cover" : fittingType;

  if (typeof src === "string" && src.startsWith("http")) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={alt}
        className={className}
        style={{ objectFit }}
        {...props}
      />
    );
  }

  return (
    <NextImage
      src={src}
      alt={alt}
      className={className}
      style={{ objectFit }}
      {...props}
    />
  );
}
