# UI Component Library

This directory contains reusable UI components built with React, Tailwind CSS, and Radix UI primitives.

## Available Components

### Badge

A small visual element for displaying status, categories, or tags.

- **Variants**: default, secondary, destructive, outline, success, warning, danger
- **Usage**: For statuses, tags, categories, labels

### Select

A dropdown menu for selecting an option from a list.

- **Features**: Custom styling, grouping, disabled states, keyboard navigation
- **Usage**: Form inputs, filters, settings

### Alert

Contextual feedback messages for typical user actions.

- **Variants**: default, destructive, success, warning, info
- **Parts**: Alert, AlertTitle, AlertDescription
- **Usage**: Error messages, success confirmation, important notices

### Tabs

Allows switching between different views within the same context.

- **Parts**: Tabs, TabsList, TabsTrigger, TabsContent
- **Usage**: Interface sections, form sections, different views of data

## Installation

1. Make sure you have the required dependencies:

```bash
npm install class-variance-authority clsx tailwind-merge @radix-ui/react-select @radix-ui/react-tabs lucide-react
```

2. Add the utility function (if not already present):

```tsx
// lib/utils.ts
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

3. Copy the component files to your project structure.

## Component Design Principles

These components follow these design principles:

1. **Accessible**: Built on Radix UI primitives for keyboard navigation and screen reader support
2. **Flexible**: Customizable through props and variants
3. **Consistent**: Uses the same styling patterns and naming conventions
4. **Composable**: Components can be used together and combined into more complex UIs

## Customization

All components can be customized using:

- **Variant Props**: For predefined style variations
- **ClassName Prop**: For custom Tailwind styling on individual instances
- **Theme Variables**: Modify your Tailwind theme for global changes

## Resources

- [Radix UI Documentation](https://www.radix-ui.com/docs/primitives/overview/introduction)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [CVA Documentation](https://cva.style/docs)