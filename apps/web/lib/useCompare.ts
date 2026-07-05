'use client';

import { useState, useEffect, useCallback } from 'react';

const KEY = 'rac_compare';
const MAX = 3;

export interface CompareVehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  imageUrl?: string;
}

function read(): CompareVehicle[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '[]');
  } catch {
    return [];
  }
}

function write(list: CompareVehicle[]) {
  localStorage.setItem(KEY, JSON.stringify(list));
  window.dispatchEvent(new Event('rac_compare_change'));
}

export function useCompare() {
  const [list, setList] = useState<CompareVehicle[]>([]);

  useEffect(() => {
    setList(read());
    const handler = () => setList(read());
    window.addEventListener('rac_compare_change', handler);
    return () => window.removeEventListener('rac_compare_change', handler);
  }, []);

  const add = useCallback((v: CompareVehicle) => {
    const cur = read();
    if (cur.find((x) => x.id === v.id)) return;
    if (cur.length >= MAX) return;
    const next = [...cur, v];
    write(next);
    setList(next);
  }, []);

  const remove = useCallback((id: string) => {
    const next = read().filter((x) => x.id !== id);
    write(next);
    setList(next);
  }, []);

  const clear = useCallback(() => {
    write([]);
    setList([]);
  }, []);

  const toggle = useCallback(
    (v: CompareVehicle) => {
      const cur = read();
      if (cur.find((x) => x.id === v.id)) remove(v.id);
      else add(v);
    },
    [add, remove],
  );

  const has = (id: string) => list.some((x) => x.id === id);
  const full = list.length >= MAX;

  return { list, add, remove, clear, toggle, has, full };
}
