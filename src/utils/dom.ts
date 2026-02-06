export const $ = (sel: string) =>
  document.querySelector(sel) as HTMLElement;

export const num = (v: string | number) => Number(v);
