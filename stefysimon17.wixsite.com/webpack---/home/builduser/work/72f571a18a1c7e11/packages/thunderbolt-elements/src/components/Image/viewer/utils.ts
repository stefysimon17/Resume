const IMAGE_REF_ATTR = 'ref="image"';

function toAttrs(attrs: Record<string, string> = {}): string {
  return Object.entries(attrs)
    .map(([name, value]) => `${name}="${value}"`)
    .join(' ');
}

export function setImagePlaceholderInSVG(
  svg: string,
  placeholder: unknown,
  attrs?: { img: Record<string, string>; container: Record<string, string> },
): string {
  return placeholder
    ? svg
        .replace(IMAGE_REF_ATTR, `xlink:href="${placeholder}"`)
        .replace(/<image\s?([^>]*)>/, (match, attrsMatch) => {
          const imageAttrs = attrs?.img;

          if (match && imageAttrs) {
            const attributePairsString = attrsMatch.match(/[^\s]+="[^"]+"/g);

            if (attributePairsString) {
              const processedAttrs = attributePairsString
                .map((attrPairStr: string) => {
                  const [key, value] = attrPairStr.split('=');

                  if (key in imageAttrs) {
                    return `${key}="${imageAttrs[key]}"`;
                  }

                  return `${key}=${value}`;
                })
                .join(' ');

              return `<image ${processedAttrs}>`;
            }

            return `<image${attrsMatch}>`;
          }

          return match || '';
        })
        .replace('<svg', `<svg ${toAttrs(attrs?.container)}`)
    : svg;
}
