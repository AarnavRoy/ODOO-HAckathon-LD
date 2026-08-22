---
name: Frontend Design Taste
description: Guidelines and best practices for creating beautiful, modern, and accessible frontend interfaces.
---

# Frontend Design Taste

When building frontend applications, adhere to these design principles:

## 1. Typography & Readability
- Use modern, clean sans-serif fonts (e.g., Inter, Roboto, San Francisco) or standard system fonts.
- Maintain a clear visual hierarchy using distinct font weights (e.g., bold for headings, regular for body) and sizes.
- Ensure high contrast between text and background colors to meet WCAG accessibility standards.

## 2. Spacing & Layout
- Use a consistent spacing system (typically a 4px or 8px baseline grid) for margins and padding.
- Group related elements together and use ample whitespace to separate distinct sections, reducing cognitive load.
- Ensure layouts are fully responsive, adapting gracefully from mobile screens up to wide desktop monitors.

## 3. Color Palette
- Stick to a cohesive and minimal color palette: a primary brand color, a few secondary/accent colors, and neutral grays for structure.
- Use color purposefully to indicate interactivity (e.g., distinct colors for buttons/links) or status (red for errors, green for success, yellow for warnings).
- Keep dark mode considerations in mind, ensuring colors invert or adjust appropriately.

## 4. Components & Interactions
- Design clear and prominent calls-to-action (CTAs).
- Provide immediate visual feedback for all user interactions (hover states, active states, focus rings, loading spinners).
- Use subtle animations and transitions (e.g., 150ms-300ms ease-in-out) to make the interface feel polished and natural.

## 5. Accessibility (a11y)
- Use semantic HTML elements (`<nav>`, `<header>`, `<main>`, `<button>` vs `<a>`).
- Ensure all interactive elements are focusable and fully usable via keyboard navigation.
- Always provide `aria-labels` for icon-only buttons and descriptive `alt` text for images.

## 6. Consistency
- Reuse standard UI components (buttons, cards, modals, inputs) throughout the application to create a predictable user experience.
- Maintain consistent styling rules for border radii, shadow depths, and icon sets across the entire project.
