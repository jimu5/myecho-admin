export function isAssetTypeAnImage(ext: string) {
    const normalizedExt = ext.startsWith('.') ? ext : `.${ext}`;
    return [
        '.png', '.jpg', '.jpeg', '.bmp', '.gif', '.webp', '.psd', '.svg', '.tiff'
    ].indexOf(normalizedExt.toLowerCase()) !== -1;
}
