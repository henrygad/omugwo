# Omugwo artwork status

Approved artwork is stored in `public/books`.

- `public/books/Omugwo_KDP_Kindle_Cover.jpg` is used for the digital-edition presentation and social metadata.
- `public/books/Omugwo_KDP_Paperback_Full_Cover_6x9.pdf` is the supplied paperback source.
- `public/books/Omugwo_Paperback_Full_Wrap.jpg` is the original 3751 × 2776 JPEG stream extracted directly from the PDF without recompression.
- `public/books/Omugwo_Paperback_Back.jpg`, `Omugwo_Paperback_Spine.jpg`, and `Omugwo_Paperback_Front.jpg` are high-quality crops used on the three CSS 3D book surfaces.
- `source-assets/Omugwo_KDP_Paperback_Interior_6x9.pdf` is the private interior source and is not publicly served.
- `public/books/interior/omugwo-page-01.webp` through `omugwo-page-08.webp` are optimized, low-resolution textures rendered from nonconsecutive interior page pairs for the physical page-turn animation.

The crop boundaries match the 6 × 9 KDP wrap: 1838 px back, 75 px spine, and 1838 px front. No artwork was redrawn, recolored, or regenerated.

Also provide a dedicated social-sharing crop (recommended 1200 × 630 px) and add its path to the Open Graph and Twitter metadata in `src/app/layout.tsx`.
