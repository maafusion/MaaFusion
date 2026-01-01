export interface Collection {
    title: string;
    description: string;
    images: string[];
}

export const FEATURED_COLLECTIONS: Collection[] = [
    {
        title: 'Pendant Collection',
        description: 'Elegant pendants crafted with precision and artistic detail.',
        images: [
            'https://p7fzjac0b1.ufs.sh/f/XMtknvqcEipyqyMCExuxbGnVptuhSZv1l5wJPH4AksO9KydN', // Pendant-P1.png
            'https://p7fzjac0b1.ufs.sh/f/XMtknvqcEipy6vz7d3tFfCgmnEwdvaYW73xKjqeDt4h81BuM', // Pendant-P2.png
            'https://p7fzjac0b1.ufs.sh/f/XMtknvqcEipysVlAL6rdjByQufPwvGkR2r4lM0JLgI9FmTX7', // Pendant-P3.png
            'https://p7fzjac0b1.ufs.sh/f/XMtknvqcEipyl6GCqNnB9rt54VLndWaO7PqKgm2JwoUj1cDQ', // Pendant-P4.png
        ],
    },
    {
        title: 'Ring Designs',
        description: 'Exquisite rings that symbolize timeless beauty and craftsmanship.',
        images: [
            'https://p7fzjac0b1.ufs.sh/f/XMtknvqcEipyd6eqcy0hMy1IRTNZstHdALVwcJU0uz5EQjvp', // Ring-P1.png
            'https://p7fzjac0b1.ufs.sh/f/XMtknvqcEipynCDCDFWPkSw93VID0a4E7JAt8WHYc5O1rZBm', // Ring-P2.png
            'https://p7fzjac0b1.ufs.sh/f/XMtknvqcEipyXJhQPTxqcEipyl1PR24aYnFzJGjfBbLSIuv3', // Ring-P3.png
        ],
    },
    {
        title: 'Murti Creations',
        description: 'Sacred Murti designs blending tradition with modern artistry.',
        images: [
            'https://p7fzjac0b1.ufs.sh/f/XMtknvqcEipy8uxnez5XCBrH7fo5ScA90Pi2DydakjmzqV1R', // Murti-P1.png
            'https://p7fzjac0b1.ufs.sh/f/XMtknvqcEipyhKKLQubW1TOFNvn4RPy9q6zMJjKcslpIbeax', // Murti-P2.png
        ],
    },
];
