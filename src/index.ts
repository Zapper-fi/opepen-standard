/**
 * Options for generating an opepen icon
 */
export interface OpepenOptions {
  /** The size of the icon in pixels */
  size?: number;
  /** A string seed to generate the icon deterministically */
  seed?: string;
  /** The scale factor for rendering the icon */
  scale?: number;
  /** The foreground color of the icon */
  color?: string;
  /** The background color of the icon */
  bgcolor?: string;
  /** The spot color used for specific pattern elements */
  spotcolor?: string;
}

interface ResolvedOptions {
  size: number;
  seed: string;
  scale: number;
  color: string;
  bgcolor: string;
  spotcolor: string;
}

type Rotation = 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight';

interface GridItem {
  row: number;
  col: number;
  type: 'square' | 'arc';
  rotation?: Rotation;
}

// The random number is a js implementation of the Xorshift PRNG
const randseed: number[] = new Array(4); // Xorshift: [x, y, z, w] 32 bit values

function seedrand(seed: string): void {
  randseed.fill(0);

  for (let i = 0; i < seed.length; i++) {
    randseed[i % 4] = (randseed[i % 4]! << 5) - randseed[i % 4]! + seed.charCodeAt(i);
  }
}

function rand(): number {
  // based on Java's String.hashCode(), expanded to 4 32bit values
  const t = randseed[0]! ^ (randseed[0]! << 11);

  randseed[0] = randseed[1]!;
  randseed[1] = randseed[2]!;
  randseed[2] = randseed[3]!;
  randseed[3] = randseed[3]! ^ (randseed[3]! >> 19) ^ t ^ (t >> 8);

  return (randseed[3]! >>> 0) / ((1 << 31) >>> 0);
}

function createColor(): string {
  //saturation is the whole color spectrum
  const h = Math.floor(rand() * 360);
  //saturation goes from 40 to 100, it avoids greyish colors
  const s = rand() * 60 + 40 + '%';
  //lightness can be anything from 0 to 100, but probabilities are a bell curve around 50%
  const l = (rand() + rand() + rand() + rand()) * 25 + '%';

  return 'hsl(' + h + ',' + s + ',' + l + ')';
}

function createImageData(size: number): number[] {
  const width = size; // Only support square icons for now
  const height = size;

  const dataWidth = Math.ceil(width / 2);
  const mirrorWidth = width - dataWidth;

  const data: number[] = [];
  for (let y = 0; y < height; y++) {
    let row: number[] = [];
    for (let x = 0; x < dataWidth; x++) {
      // this makes foreground and background color to have a 43% (1/2.3) probability
      // spot color has 13% chance
      row[x] = Math.floor(rand() * 2.3);
    }
    const r = row.slice(0, mirrorWidth);
    r.reverse();
    row = row.concat(r);

    for (let i = 0; i < row.length; i++) {
      data.push(row[i]!);
    }
  }

  return data;
}

function buildOpts(opts: OpepenOptions): ResolvedOptions {
  const resolution = 8; // should not be changed opepens are 8x8 fren

  const updatedScale = (opts.size ?? resolution) / resolution;

  const seed = opts.seed || Math.floor(Math.random() * Math.pow(10, 16)).toString(16);

  seedrand(seed);

  return {
    seed,
    size: 8,
    scale: updatedScale || 4,
    color: opts.color || createColor(),
    bgcolor: opts.bgcolor || createColor(),
    spotcolor: opts.spotcolor || createColor(),
  };
}

const opepenGrid: GridItem[] = [
  { row: 3, col: 3, type: 'square' },
  { row: 3, col: 4, type: 'arc', rotation: 'topRight' },
  { row: 3, col: 5, type: 'arc', rotation: 'topLeft' },
  { row: 3, col: 6, type: 'arc', rotation: 'topRight' },
  { row: 4, col: 3, type: 'arc', rotation: 'bottomLeft' },
  { row: 4, col: 5, type: 'arc', rotation: 'bottomLeft' },
  { row: 5, col: 3, type: 'square' },
  { row: 5, col: 4, type: 'square' },
  { row: 5, col: 5, type: 'square' },
  { row: 5, col: 6, type: 'square' },
  { row: 6, col: 3, type: 'arc', rotation: 'bottomLeft' },
  { row: 6, col: 4, type: 'square' },
  { row: 6, col: 5, type: 'square' },
  { row: 6, col: 6, type: 'arc', rotation: 'bottomRight' },
  { row: 8, col: 3, type: 'arc', rotation: 'topLeft' },
  { row: 8, col: 4, type: 'square' },
  { row: 8, col: 5, type: 'square' },
  { row: 8, col: 6, type: 'arc', rotation: 'topRight' },
];

export function renderIcon(opts: OpepenOptions | undefined, canvas: HTMLCanvasElement): HTMLCanvasElement {
  const resolvedOpts = buildOpts(opts || {});
  const imageData = createImageData(resolvedOpts.size);
  const width = Math.sqrt(imageData.length);

  canvas.width = canvas.height = resolvedOpts.size * resolvedOpts.scale;

  const cc = canvas.getContext('2d')!;
  cc.fillStyle = resolvedOpts.bgcolor;
  cc.fillRect(0, 0, canvas.width, canvas.height);
  cc.fillStyle = resolvedOpts.color;

  for (let i = 0; i < imageData.length; i++) {
    const row = Math.floor(i / width);
    const col = i % width;
    const opepenGridItem = opepenGrid.find(item => item.row === row + 1 && item.col === col + 1);

    if (row === 0 || col === 0 || col === width - 1) {
      if (imageData[i]) {
        // if data is 2, choose spot color, if 1 choose foreground
        cc.fillStyle = imageData[i] === 1 ? resolvedOpts.color : resolvedOpts.spotcolor;

        cc.fillRect(col * resolvedOpts.scale, row * resolvedOpts.scale, resolvedOpts.scale, resolvedOpts.scale);
      }
    }

    if (opepenGridItem) {
      cc.fillStyle = imageData[i] === 1 ? resolvedOpts.color : resolvedOpts.spotcolor;

      if (opepenGridItem.type === 'square') {
        cc.fillRect(col * resolvedOpts.scale, row * resolvedOpts.scale, resolvedOpts.scale, resolvedOpts.scale);
      }

      if (opepenGridItem.type === 'arc') {
        cc.beginPath();

        if (opepenGridItem.rotation === 'topLeft') {
          cc.moveTo((col + 1) * resolvedOpts.scale, (row + 1) * resolvedOpts.scale + resolvedOpts.scale);
          cc.lineTo((col + 1) * resolvedOpts.scale, (row + 1) * resolvedOpts.scale);
          cc.arc((col + 1) * resolvedOpts.scale, (row + 1) * resolvedOpts.scale, resolvedOpts.scale, Math.PI, 1.5 * Math.PI, false);
          cc.lineTo((col + 1) * resolvedOpts.scale, (row + 1) * resolvedOpts.scale + resolvedOpts.scale);
        }

        if (opepenGridItem.rotation === 'topRight') {
          cc.moveTo((col - 1) * resolvedOpts.scale + resolvedOpts.scale, row * resolvedOpts.scale + resolvedOpts.scale);
          cc.lineTo((col - 1) * resolvedOpts.scale + resolvedOpts.scale, row * resolvedOpts.scale);
          cc.arc(
            (col - 1) * resolvedOpts.scale + resolvedOpts.scale,
            row * resolvedOpts.scale + resolvedOpts.scale,
            resolvedOpts.scale,
            1.5 * Math.PI,
            2 * Math.PI,
          );
          cc.lineTo((col - 1) * resolvedOpts.scale + resolvedOpts.scale, row * resolvedOpts.scale + resolvedOpts.scale);
        }

        if (opepenGridItem.rotation === 'bottomLeft') {
          cc.moveTo((col + 1) * resolvedOpts.scale, (row - 1) * resolvedOpts.scale + resolvedOpts.scale);
          cc.lineTo((col + 1) * resolvedOpts.scale, (row - 1) * resolvedOpts.scale + resolvedOpts.scale);
          cc.arc(
            (col + 1) * resolvedOpts.scale,
            (row - 1) * resolvedOpts.scale + resolvedOpts.scale,
            resolvedOpts.scale,
            0.5 * Math.PI,
            Math.PI,
            false,
          );
          cc.lineTo((col + 1) * resolvedOpts.scale, (row - 1) * resolvedOpts.scale + resolvedOpts.scale);
        }

        if (opepenGridItem.rotation === 'bottomRight') {
          cc.moveTo((col - 1) * resolvedOpts.scale + resolvedOpts.scale, (row - 1) * resolvedOpts.scale);
          cc.lineTo((col - 1) * resolvedOpts.scale + resolvedOpts.scale, (row - 1) * resolvedOpts.scale + resolvedOpts.scale);
          cc.arc(
            (col - 1) * resolvedOpts.scale + resolvedOpts.scale,
            (row - 1) * resolvedOpts.scale + resolvedOpts.scale,
            resolvedOpts.scale,
            0,
            Math.PI * 0.5,
            false,
          );
          cc.lineTo((col - 1) * resolvedOpts.scale + resolvedOpts.scale, (row - 1) * resolvedOpts.scale);
        }

        cc.closePath();
        cc.fill();
      }
    }
  }

  return canvas;
}

export function createIcon(opts: OpepenOptions): HTMLCanvasElement {
  const canvas = document.createElement('canvas');

  renderIcon(opts, canvas);

  return canvas;
}
