Opepen Standard
========

A tiny library for generating opepen identicons.

![Sample blockies image](https://raw.githubusercontent.com/Zapper-fi/opepen-standard/master/examples/sample.png "Opepen")

Browser
---

Install
-----

    npm i opepen-standard


```javascript
import { createIcon } from 'opepen-standard';

var icon = createIcon({ // All options are optional
    seed: 'randstring', // seed used to generate icon data, default: random
    color: '#dfe', // optional
    bgcolor: '#aaa', // optional
    size: 32, // width/height of the icon in blocks, default: 32
});

document.body.appendChild(icon); // icon is a canvas element
```

React
---

```javascript
import React from 'react';

import { createIcon } from 'opepen-standard';

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

Because the default Opepen grid is 8x8, it is better to use a size that is dividable by 8.


Build
-----

    npm run build

License
-------

[WTFPL](http://www.wtfpl.net/)
