'use client';

import { useEffect, useState } from 'react';
import { TYPE_SIZES, applyTypeSize, readTypeSize, type TypeSizeId } from '@/lib/typeSize';

export function TypeSizePicker() {
  const [id, setId] = useState<TypeSizeId>('m');

  useEffect(() => {
    const current = readTypeSize();
    setId(current);
    applyTypeSize(current);
  }, []);

  return (
    <div className="row" role="group" aria-label="Type size">
      {TYPE_SIZES.map((size) => (
        <button
          key={size.id}
          type="button"
          className="chip"
          aria-pressed={id === size.id}
          onClick={() => {
            applyTypeSize(size.id);
            setId(size.id);
          }}
        >
          {size.label}
        </button>
      ))}
    </div>
  );
}
