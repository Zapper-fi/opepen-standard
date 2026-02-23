Opepicons
========

A tiny library for generating opepen identicons.

![Opepicons](examples/sample.png)

Install
-----

    npm i @visualizevalue/opepicons


```typescript
import { createIcon } from '@visualizevalue/opepicons';

const icon = createIcon({ // All options are optional
    seed: 'randstring', // seed used to generate icon data, default: random
    color: '#dfe', // optional
    bgcolor: '#aaa', // optional
    size: 32, // width/height of the icon in pixels, default: 32
});

document.body.appendChild(icon); // icon is a canvas element
```

React
---

```typescript
import React from 'react';
import { createIcon } from '@visualizevalue/opepicons';

export const OpepenAvatar: React.FC<{ address: string; size: number }> = ({ address, size }) => {
  const canvas = createIcon({
    seed: address,
    size,
  });

  return (
    <img src={canvas.toDataURL()} alt="Opepen Avatar" />
  );
};
```

Notes
-----

Because the default Opepen grid is 8x8, it is better to use a size that is divisible by 8.


Build
-----

    pnpm run build

License
-------

[WTFPL](http://www.wtfpl.net/)

Credits
-------

Based on [opepen-standard](https://github.com/Zapper-fi/opepen-standard), which itself was based on [blockies](https://github.com/download13/blockies).
