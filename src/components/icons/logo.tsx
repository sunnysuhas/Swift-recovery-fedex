import type { SVGProps } from 'react';

export function Logo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 256 256"
      width="1em"
      height="1em"
      {...props}
    >
      <g fill="currentColor">
        <path
          d="M128 24a104 104 0 1 0 104 104A104.11 104.11 0 0 0 128 24Zm0 192a88 88 0 1 1 88-88a88.1 88.1 0 0 1-88 88Z"
        />
        <path
          d="m173.11 107.4-48-32a8 8 0 0 0-10.22 0l-48 32A8 8 0 0 0 64 114.63V176a8 8 0 0 0 8 8h112a8 8 0 0 0 8-8v-61.37a8 8 0 0 0-3.11-6.23ZM176 168H80v-53.37l45.11-30.07a.19.19 0 0 1 .1 0L176 114.63Z"
        />
        <path d="M112 144h32a8 8 0 0 0 0-16h-32a8 8 0 0 0 0 16Z" />
      </g>
    </svg>
  );
}
