# CSS Design System Documentation

## Overview

This directory contains a structured and modular CSS design system for the application. The system is organized into three main categories: base styles, component styles, and layout styles.

## Directory Structure

```
styles/
├── base/                   # Foundation styles
│   ├── variables.css      # Design tokens (colors, spacing, typography)
│   ├── reset.css          # CSS reset and normalization
│   └── typography.css     # Typography styles and utilities
├── components/            # Component-specific styles
│   ├── buttons.css        # Button components and variants
│   ├── cards.css          # Card components and layouts
│   ├── forms.css          # Form elements and validation states
│   ├── tables.css         # Table components and responsive layouts
│   └── tabs.css           # Tab navigation and content
├── layouts/               # Page layout styles
│   ├── page.css           # Page structure and containers
│   └── responsive.css     # Responsive design and media queries
└── index.css              # Main entry point (imports all modules)
```

## Usage

### Importing Styles

The entire design system is imported through a single entry point in `main.ts`:

```typescript
import './styles/index.css'
```

This automatically includes all base, component, and layout styles.

### Using CSS Variables

All design tokens are defined as CSS custom properties (variables) in `base/variables.css`:

```css
/* Example usage in component styles */
.my-component {
  color: var(--text-primary);
  background-color: var(--bg-secondary);
  padding: var(--space-4);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
}
```

### Design Tokens

#### Colors

**Primary Colors:**
- `--color-primary` - Main brand color (#0070BB)
- `--color-primary-hover` - Hover state
- `--color-primary-light` - Light variant

**Neutral Colors:**
- `--color-gray-50` through `--color-gray-900`
- `--color-white`, `--color-black`

**Semantic Colors:**
- `--color-success`, `--color-success-light`
- `--color-warning`, `--color-warning-light`
- `--color-error`, `--color-error-light`
- `--color-info`, `--color-info-light`

**Text Colors:**
- `--text-primary` - Primary text (#111827)
- `--text-secondary` - Secondary text (#6B7280)
- `--text-tertiary` - Tertiary text (#9CA3AF)

#### Spacing

Based on an 8px scale:
- `--space-1` (4px) through `--space-16` (64px)

#### Border Radius

- `--radius-sm` (4px) - Small radius
- `--radius-md` (6px) - Medium radius
- `--radius-lg` (8px) - Large radius
- `--radius-xl` (12px) - Extra large radius
- `--radius-full` (9999px) - Full/pill shape

#### Shadows

- `--shadow-xs` - Extra small shadow
- `--shadow-sm` - Small shadow
- `--shadow-md` - Medium shadow
- `--shadow-lg` - Large shadow
- `--shadow-xl` - Extra large shadow

#### Typography

**Font Sizes:**
- `--font-size-xs` (12px) through `--font-size-4xl` (36px)

**Font Weights:**
- `--font-weight-normal` (400)
- `--font-weight-medium` (500)
- `--font-weight-semibold` (600)
- `--font-weight-bold` (700)

**Line Heights:**
- `--line-height-tight` (1.25)
- `--line-height-normal` (1.5)
- `--line-height-relaxed` (1.75)

## Component Classes

### Buttons

```html
<!-- Primary Button -->
<button class="btn btn-primary">Primary</button>

<!-- Secondary Button -->
<button class="btn btn-secondary">Secondary</button>

<!-- Danger Button -->
<button class="btn btn-danger">Delete</button>

<!-- Small Button -->
<button class="btn btn-primary btn-sm">Small</button>

<!-- Large Button -->
<button class="btn btn-primary btn-lg">Large</button>

<!-- Icon Button -->
<button class="btn btn-icon btn-primary">
  <i class="icon"></i>
</button>
```

### Cards

```html
<!-- Basic Card -->
<div class="card">
  <div class="card-header">
    <h3 class="card-title">Card Title</h3>
  </div>
  <div class="card-body">
    Card content goes here
  </div>
  <div class="card-footer">
    Footer content
  </div>
</div>

<!-- Panel Section (Legacy Support) -->
<div class="panel-section">
  <div class="section-title">Section Title</div>
  <div class="card-content">
    Content
  </div>
</div>
```

### Forms

```html
<!-- Form Group -->
<div class="form-group">
  <label class="form-label form-label-required">Username</label>
  <input type="text" class="form-input" placeholder="Enter username">
  <span class="form-help">Username must be unique</span>
</div>

<!-- Input Sizes -->
<input type="text" class="form-input form-input-sm">
<input type="text" class="form-input">
<input type="text" class="form-input form-input-lg">

<!-- Validation States -->
<input type="email" class="form-input is-valid">
<input type="email" class="form-input is-invalid">
<span class="invalid-feedback">Invalid email address</span>

<!-- Switch Toggle -->
<div class="form-switch">
  <input type="checkbox" id="switch1">
  <span class="form-switch-slider"></span>
</div>
```

### Tables

```html
<!-- Responsive Table -->
<div class="table-container">
  <table class="table table-hover">
    <thead>
      <tr>
        <th>Column 1</th>
        <th>Column 2</th>
        <th class="table-action">Actions</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Data 1</td>
        <td>Data 2</td>
        <td class="table-action">
          <div class="table-actions">
            <button class="btn btn-sm btn-primary">Edit</button>
            <button class="btn btn-sm btn-danger">Delete</button>
          </div>
        </td>
      </tr>
    </tbody>
  </table>
</div>

<!-- Status Badges -->
<span class="table-badge table-badge-success">Active</span>
<span class="table-badge table-badge-warning">Pending</span>
<span class="table-badge table-badge-error">Error</span>
```

### Tabs

```html
<!-- Basic Tabs -->
<div class="tabs">
  <div class="tab-navigation">
    <button class="tab-button active">Tab 1</button>
    <button class="tab-button">Tab 2</button>
    <button class="tab-button">Tab 3</button>
  </div>
  <div class="tab-content">
    <div class="tab-pane active">Content 1</div>
    <div class="tab-pane">Content 2</div>
    <div class="tab-pane">Content 3</div>
  </div>
</div>

<!-- Pills Style -->
<div class="tab-navigation tabs-pills">
  <button class="tab-button active">Tab 1</button>
  <button class="tab-button">Tab 2</button>
</div>
```

## Layout Classes

### Page Structure

```html
<div class="app-container">
  <aside class="sidebar"><!-- Sidebar --></aside>
  <main class="main-content">
    <header class="header"><!-- Header --></header>
    <div class="page-container">
      <h1 class="page-title">Page Title</h1>
      <div class="page-content">
        <!-- Page content -->
      </div>
    </div>
  </main>
</div>
```

### Grid Layout

```html
<!-- 2-Column Grid -->
<div class="grid grid-cols-2">
  <div>Column 1</div>
  <div>Column 2</div>
</div>

<!-- Responsive Grid (1 col on mobile, 3 cols on desktop) -->
<div class="grid grid-cols-1 grid-cols-3-lg">
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</div>
```

### Utility Classes

```html
<!-- Flexbox -->
<div class="flex items-center justify-between gap-4">
  <div>Left content</div>
  <div>Right content</div>
</div>

<!-- Spacing -->
<div class="mt-4 mb-6 p-4">Content with margins and padding</div>

<!-- Text Utilities -->
<p class="text-center text-lg font-semibold text-primary">
  Centered, large, bold, primary text
</p>

<!-- Display -->
<div class="hidden">Hidden content</div>
<span class="block">Block-level span</span>

<!-- Truncate -->
<p class="truncate">This text will be truncated with ellipsis...</p>
```

## Responsive Design

The design system includes responsive breakpoints:

- **Mobile:** < 576px
- **Tablet:** < 768px
- **Desktop:** ≥ 1024px
- **Large Desktop:** ≥ 1280px

Mobile-first approach with automatic responsive adjustments for:
- Tables → Mobile cards
- Multi-column grids → Single column
- Form layouts → Stacked layout
- Button groups → Full-width stacked

## Best Practices

1. **Use CSS Variables:** Always use design tokens instead of hard-coded values
2. **Mobile First:** Design for mobile first, then enhance for larger screens
3. **Semantic Classes:** Use meaningful class names that describe purpose
4. **Avoid Inline Styles:** Use utility classes or component styles instead
5. **Component Scoping:** Keep component-specific styles in Vue `<style scoped>` blocks
6. **Accessibility:** Use proper semantic HTML and ARIA attributes

## Migration Guide

### From Old Styles

If you have components using the old `style.css`:

**Before:**
```css
.my-component {
  background-color: #f5f5f5;
  padding: 1.5rem;
  border: 1px solid #e0e0e0;
}
```

**After:**
```css
.my-component {
  background-color: var(--bg-primary);
  padding: var(--space-6);
  border: 1px solid var(--border-color);
}
```

Or use utility classes:
```html
<div class="card p-6">
  <!-- Content -->
</div>
```

## Adding New Styles

### Adding Component Styles

Create a new file in `styles/components/` and import it in `styles/index.css`:

```css
/* styles/components/my-component.css */
.my-component {
  /* Component styles */
}
```

```css
/* styles/index.css */
@import './components/my-component.css';
```

### Adding New Variables

Add new design tokens to `styles/base/variables.css`:

```css
:root {
  --my-custom-color: #FF5733;
  --my-custom-spacing: 2.5rem;
}
```

## Support

For questions or issues with the design system, please refer to:
- Design System Documentation (this file)
- Component Examples in Storybook (if available)
- Team Design Guidelines

---

**Last Updated:** 2025-11-14
**Version:** 1.0.0
