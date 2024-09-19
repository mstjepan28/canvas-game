type TClampOptions = {
  min?: number;
  max?: number;
};

export const clampValue = (value: number, options?: TClampOptions) => {
  const min = options?.min || Number.NEGATIVE_INFINITY;
  const max = options?.max || Number.POSITIVE_INFINITY;

  return Math.min(Math.max(value, min), max);
};
