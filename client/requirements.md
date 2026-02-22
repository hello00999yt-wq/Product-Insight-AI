## Packages
framer-motion | Complex animations for page transitions and reveal effects
react-dropzone | Drag and drop file uploads
clsx | Utility for conditional class names (standard with tailwind-merge)
tailwind-merge | Utility for merging tailwind classes

## Notes
- API endpoint `POST /api/products/analyze` accepts `{ image: string }` (base64)
- Images need to be converted to base64 on the client before sending
- Response includes `fakeRiskLevel` which should map to UI colors (Low=Green, Medium=Yellow, High=Red)
- History is fetched from `GET /api/products`
