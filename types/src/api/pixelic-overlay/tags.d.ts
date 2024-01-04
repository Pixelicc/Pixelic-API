export interface PixelicOverlayTag {
  text?: string;
  tooltip?: string;
  color?: string;
  appendIcon?: string;
  prependIcon?: string;
}

export type PixelicOverlayTagList = {
  [key: string]: [Tag];
};
