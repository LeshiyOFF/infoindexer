/**
 * Ambient module declarations for CSS imports
 *
 * Fixes: Cannot find module or type declarations for side-effect import of './globals.css'
 * Works with moduleResolution: "bundler" in Next.js 14+
 *
 * @see https://github.com/vercel/next.js/discussions/84317
 * @see https://github.com/microsoft/TypeScript/issues/63181
 */

declare module '*.css';

declare module '*.module.css' {
  const classes: { readonly [key: string]: string };
  export default classes;
}

declare module '*.scss';

declare module '*.module.scss' {
  const classes: { readonly [key: string]: string };
  export default classes;
}
