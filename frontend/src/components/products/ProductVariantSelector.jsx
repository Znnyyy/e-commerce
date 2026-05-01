export default function ProductVariantSelector({
  colors,
  allSizes,
  activeColor,
  handleColorClick,
  variants,
  selectedVariant,
  setSelectedVariantId
}) {
  return (
    <>
      {colors.length > 0 && (
        <div className="mt-8">
          <span className="opacity-60 uppercase tracking-widest text-sm font-medium mb-3 block">Select Colorway</span>
          <div className="flex flex-wrap gap-2">
            {colors.map((color) => (
              <button
                key={color}
                onClick={() => handleColorClick(color)}
                className={`px-4 py-2 border font-bold transition-all duration-200 capitalize ${
                  activeColor === color
                    ? "bg-black border-black text-brand-bg" 
                    : "border-black/20 text-black hover:border-black hover:bg-brand-bg"
                }`}
              >
                {color}
              </button>
            ))}
          </div>
        </div>
      )}

      {allSizes.length > 0 && (
        <div className="mt-6">
          <span className="opacity-60 uppercase tracking-widest text-sm font-medium mb-3 block">Select Size (EU)</span>
          <div className="flex flex-wrap gap-2">
            {allSizes.map((size) => {
              const variantForSize = variants.find(v => v.color === activeColor && v.size === size);
              const isAvailable = variantForSize && variantForSize.stock > 0;
              const isSelected = selectedVariant?.size === size && selectedVariant?.color === activeColor;
              
              return (
                <button
                  key={size}
                  onClick={() => {
                    if (variantForSize) {
                      setSelectedVariantId(variantForSize.id);
                    }
                  }}
                  disabled={!isAvailable}
                  className={`px-4 py-2 border font-bold transition-all duration-200 ${
                    isSelected
                      ? "bg-black border-black text-brand-bg" 
                      : isAvailable 
                         ? "border-black/20 text-black hover:border-black hover:bg-brand-bg"
                         : "border-black/10 text-black/30 bg-black/5 cursor-not-allowed"
                  }`}
                >
                  {size}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}
