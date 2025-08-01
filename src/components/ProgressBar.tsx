'use client';

import NextTopLoader from 'nextjs-toploader';

export function ProgressBar() {
  return (
    <NextTopLoader
      color="linear-gradient(to right, #06b6d4, #22d3ee)"
      initialPosition={0.08}
      crawlSpeed={200}
      height={3}
      crawl={true}
      showSpinner={false}
      easing="ease"
      speed={200}
      shadow="0 0 10px #06b6d4, 0 0 5px #22d3ee"
      template='<div class="bar" role="bar"><div class="peg"></div></div>'
      zIndex={1600}
      showAtBottom={false}
    />
  );
}