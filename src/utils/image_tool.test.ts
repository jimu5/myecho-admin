import { isAssetTypeAnImage } from './image_tool';

describe('isAssetTypeAnImage', () => {
  test('accepts supported image extensions case-insensitively', () => {
    for (const ext of ['png', '.png', '.JPG', 'jpeg', '.BMP', '.gif', '.webp', '.psd', '.SVG', '.tiff']) {
      expect(isAssetTypeAnImage(ext)).toBe(true);
    }
  });

  test('rejects unsupported or extensionless values', () => {
    for (const ext of ['.txt', '.pdf', '', '.svgz']) {
      expect(isAssetTypeAnImage(ext)).toBe(false);
    }
  });
});
