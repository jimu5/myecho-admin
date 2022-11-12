export function isAssetTypeAnImage(ext: string) {
    return [
        '.png', '.jpg', '.jpeg', '.bmp', '.gif', '.webp', '.psd', '.svg', '.tiff'].
        indexOf(ext.toLowerCase()) !== -1;
}