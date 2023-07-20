Blockies
========

A tiny library for generating opepen identicons.

![Sample blockies image](https://raw.githubusercontent.com/Zapper-fi/opepen-standard/master/examples/sample.png "Opepen")

Browser
---

Install
-----

    npm i opepen-standard


```javascript
import { createIcon } from 'opepepen-standard';

var icon = createIcon({ // All options are optional
    seed: 'randstring', // seed used to generate icon data, default: random
    color: '#dfe', // to manually specify the icon color, default: random
    bgcolor: '#aaa', // choose a different background color, default: white
    size: 32, // width/height of the icon in blocks, default: 32
});

document.body.appendChild(icon); // icon is a canvas element
```

React
---

```javascript
import React from 'react';

import { createIcon } from 'opepepen-standard';

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

Always use a size that is dividable by 8, otherwise the opepens will not render as well. As the default Opepen grid is 8x8.


Build
-----

    npm run build

License
-------

[WTFPL](http://www.wtfpl.net/)