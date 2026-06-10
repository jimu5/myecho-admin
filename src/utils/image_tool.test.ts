import { isAssetTypeAnImage } from './image_tool';

describe('isAssetTypeAnImage', () => {
  test('accepts supported image extensions case-insensitively', () => {
    for (const ext of ['.png', '.JPG', '.jpeg', '.BMP', '.gif', '.webp', '.psd', '.SVG', '.tiff']) {
      expect(isAssetTypeAnImage(ext)).toBe(true);
    }
  });

  test('rejects unsupported or extensionless values', () => {
    for (const ext of ['png', '.txt', '.pdf', '', '.svgz']) {
      expect(isAssetTypeAnImage(ext)).toBe(false);
    }
  });
});
