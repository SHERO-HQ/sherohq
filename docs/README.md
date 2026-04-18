# SheroTech Design System Documentation

**Comprehensive guide for maintaining visual consistency, brand integrity, and technical excellence.**

---

## 📚 Documentation Structure

SheroTech design documentation is organized into four primary guides:

### 1. [DESIGN_GUIDE.md](./DESIGN_GUIDE.md) — Comprehensive Reference

**For**: Designers, product managers, decision-makers  
**Contains**:

- Brand philosophy and core principles
- Complete color system (oklch color space with light/dark modes)
- Typography scale and font stack
- Spacing and layout grid system
- Component specifications and states
- Motion and animation principles
- Dark mode implementation
- Accessibility standards (WCAG AA compliance)
- Photography and imagery guidelines
- Voice and tone guidelines
- Best practices and testing checklists

**When to use**: Foundational questions, design decisions, strategic overview

---

### 2. [BRAND_STYLE_REFERENCE.md](./BRAND_STYLE_REFERENCE.md) — Quick Lookup

**For**: Developers, designers needing fast answers  
**Contains**:

- Color palette at a glance
- Typography essentials (sizes, weights, usage)
- Spacing quick reference
- Component code snippets (ready to copy)
- Animation snippets
- Dark mode usage
- Accessibility checklist
- Image optimization guidelines
- Responsive design patterns
- Common mistakes to avoid

**When to use**: During development, quick decisions, code references

---

### 3. [COMPONENT_IMPLEMENTATION_GUIDE.md](./COMPONENT_IMPLEMENTATION_GUIDE.md) — Code Examples

**For**: Frontend developers building components  
**Contains**:

- Complete component templates with full code
  - Button (primary, secondary, variants)
  - Card (with subcomponents)
  - Form Field (with validation)
  - Badge (multi-variant)
  - Modal (with animations)
  - Select Dropdown
  - Animation Wrapper
- Real-world usage examples
- Best practices for component development
- File organization strategies
- Component testing checklist
- Common imports quick reference

**When to use**: Building new components, refactoring existing code, learning patterns

---

### 4. [README.md](./README.md) — This File

**For**: Everyone  
**Purpose**: Navigation and overview of all design documentation

---

## 🎨 Quick Start Guide

### For Designers

1. Start with [DESIGN_GUIDE.md](./DESIGN_GUIDE.md) — Section: "Brand Philosophy"
2. Review color system and semantics
3. Study component specifications
4. Check accessibility section before finalizing designs

### For Developers

1. Bookmark [BRAND_STYLE_REFERENCE.md](./BRAND_STYLE_REFERENCE.md)
2. Review [COMPONENT_IMPLEMENTATION_GUIDE.md](./COMPONENT_IMPLEMENTATION_GUIDE.md) for your component type
3. Copy component template and adapt to your needs
4. Reference [DESIGN_GUIDE.md](./DESIGN_GUIDE.md) for deeper context

### For Product Managers

1. Read [DESIGN_GUIDE.md](./DESIGN_GUIDE.md) — Section: "Brand Philosophy"
2. Understand the design principles and voice/tone
3. Use as reference for design reviews and decisions

---

## 🎯 Common Scenarios

### "I need to create a new button variant"

→ See: [COMPONENT_IMPLEMENTATION_GUIDE.md](./COMPONENT_IMPLEMENTATION_GUIDE.md#button-component)

### "What color should this error state be?"

→ See: [BRAND_STYLE_REFERENCE.md](./BRAND_STYLE_REFERENCE.md#quick-decisions)

### "How should this component animate?"

→ See: [DESIGN_GUIDE.md](./DESIGN_GUIDE.md#motion--animation) or [BRAND_STYLE_REFERENCE.md](./BRAND_STYLE_REFERENCE.md#quick-decisions)

### "Is this accessible enough?"

→ See: [DESIGN_GUIDE.md](./DESIGN_GUIDE.md#accessibility)

### "What's the complete component API?"

→ See: [COMPONENT_IMPLEMENTATION_GUIDE.md](./COMPONENT_IMPLEMENTATION_GUIDE.md)

### "What's our brand voice?"

→ See: [DESIGN_GUIDE.md](./DESIGN_GUIDE.md#voice--tone)

### "How do I optimize images?"

→ See: [DESIGN_GUIDE.md](./DESIGN_GUIDE.md#photography--imagery) or [BRAND_STYLE_REFERENCE.md](./BRAND_STYLE_REFERENCE.md#image-optimization)

---

## 🎨 Design System at a Glance

### Color Palette

- **Primary**: Emerald (`#10b981` light / brighter in dark)
- **Neutrals**: Deep slate backgrounds with white text; light backgrounds with slate text
- **Semantics**: Red (destructive), Amber (warning), Blue (info)
- **Implementation**: oklch color space for superior perceptual uniformity

### Typography

- **Primary Font**: Sora Variable (UI, headings, body)
- **Monospace**: JetBrains Mono Variable (code, prices, data)
- **Base Size**: 15px
- **Scale**: 7 heading levels + body sizes

### Spacing

- **Unit**: 8px base
- **Scale**: xs (2px) → sm (4px) → md (8px) → lg (12px) → xl (16px) → 2xl (24px) → 3xl (32px)
- **Border Radius**: 6px (default), 8px (prominent), 16px (featured)

### Animation

- **Duration**: 150ms (micro) → 300ms (short) → 600ms (medium) → 1200ms (long)
- **Easing**: easeInOut (transitions), easeOut (entry), easeIn (exit), spring (playful)
- **Principle**: Motion guides attention and provides feedback

### Accessibility

- **Standard**: WCAG 2.1 Level AA
- **Contrast**: 4.5:1 minimum for normal text, 3:1 for large text
- **Focus**: Always visible, 3px minimum
- **Motion**: Respects `prefers-reduced-motion` setting

---

## 📱 Responsive Breakpoints

| Breakpoint | Width      | Devices                | Container Padding |
| ---------- | ---------- | ---------------------- | ----------------- |
| **xs–sm**  | < 640px    | Mobile phones          | `px-4` (16px)     |
| **md**     | 640–1024px | Tablets                | `px-6` (24px)     |
| **lg+**    | > 1024px   | Desktop, large screens | `px-8` (32px)     |

**Design Approach**: Mobile-first development, enhance for larger screens

---

## 🛠️ Technology Stack

- **Styling**: Tailwind CSS v4
- **Framework**: React 18 + Next.js (App Router)
- **Animation**: Framer Motion
- **Icons**: Lucide React
- **Color Space**: oklch (CSS custom properties)
- **Components**: Compound component pattern

---

## 📋 Maintenance & Updates

### Adding New Components

1. Build following [COMPONENT_IMPLEMENTATION_GUIDE.md](./COMPONENT_IMPLEMENTATION_GUIDE.md)
2. Test in light & dark modes
3. Verify accessibility (keyboard, screen reader, contrast)
4. Add to component library documentation
5. Include TypeScript types and JSDoc comments

### Updating Color System

1. Edit `src/index.css` (CSS variable definitions)
2. Update color palette in [DESIGN_GUIDE.md](./DESIGN_GUIDE.md)
3. Test all components in affected colors
4. Verify contrast ratios still meet WCAG AA

### Updating Typography

1. Edit font imports in layout (`next/font`)
2. Update CSS variables in `src/index.css`
3. Document changes in [DESIGN_GUIDE.md](./DESIGN_GUIDE.md)
4. Test rendering across different devices/OS

### Documentation Changes

1. Update relevant guide file(s)
2. Update this overview if structure changes
3. Include version and date in changelog section
4. Communicate changes to team

---

## 🚀 Getting Started Checklist

- [ ] Read [DESIGN_GUIDE.md](./DESIGN_GUIDE.md) — Brand Philosophy section
- [ ] Bookmark [BRAND_STYLE_REFERENCE.md](./BRAND_STYLE_REFERENCE.md) for quick reference
- [ ] Review [COMPONENT_IMPLEMENTATION_GUIDE.md](./COMPONENT_IMPLEMENTATION_GUIDE.md) — at least Button, Card, FormField
- [ ] Run `yarn dev` and preview components in both light/dark modes
- [ ] Test keyboard navigation on all interactive elements
- [ ] Check contrast ratios using Chrome DevTools Lighthouse Accessibility audit
- [ ] Verify responsive behavior on mobile, tablet, desktop

---

## 📞 Questions & Support

### Design Questions

- Consult [DESIGN_GUIDE.md](./DESIGN_GUIDE.md) first (comprehensive reference)
- Check [BRAND_STYLE_REFERENCE.md](./BRAND_STYLE_REFERENCE.md) for quick answers
- Review existing components in `src/components/` for implementation patterns

### Implementation Questions

- Reference [COMPONENT_IMPLEMENTATION_GUIDE.md](./COMPONENT_IMPLEMENTATION_GUIDE.md)
- Look at similar existing components in codebase
- Check TypeScript types and JSDoc comments in component files

### Accessibility Questions

- Review [DESIGN_GUIDE.md](./DESIGN_GUIDE.md) — Accessibility section
- Use Chrome DevTools Lighthouse for audits
- Test with keyboard navigation and screen readers

---

## 📊 Documentation Statistics

| Document                                                                 | Sections                | Focus                   |
| ------------------------------------------------------------------------ | ----------------------- | ----------------------- |
| [DESIGN_GUIDE.md](./DESIGN_GUIDE.md)                                     | 11 major sections       | Comprehensive reference |
| [BRAND_STYLE_REFERENCE.md](./BRAND_STYLE_REFERENCE.md)                   | Quick lookup tables     | Fast answers            |
| [COMPONENT_IMPLEMENTATION_GUIDE.md](./COMPONENT_IMPLEMENTATION_GUIDE.md) | 10+ component templates | Code examples           |
| [README.md](./README.md)                                                 | This file               | Navigation & overview   |

---

## 🔗 Related Files & Resources

### Project Files

- **Design System**: `src/index.css` (colors, typography, utilities)
- **Theme Context**: `src/context/ThemeContext.tsx` (light/dark toggle)
- **UI Components**: `src/components/ui/` (reusable primitives)
- **Layout**: `src/components/layout/` (page structure)

### External Resources

- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Framer Motion Docs](https://www.framer.com/motion/)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [oklch Color Picker](https://oklch.com/)
- [Lucide React Icons](https://lucide.dev/)
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)

---

## 🎯 Design Philosophy Summary

SheroTech's design is:

- **Premium Yet Accessible**: Clean, modern interfaces inspired by Apple/HP/Dell
- **Clear & Direct**: Reduced visual noise, proof-oriented messaging
- **Inclusive**: WCAG AA compliant, accessible to all users
- **Performant**: Optimized images, smooth animations, fast load times
- **Local-First**: Tailored for Ghanaian market (currencies, payment methods, context)
- **Consistent**: Centralized design system, CSS variables, component library

---

## 📅 Changelog

| Version | Date           | Changes                                             |
| ------- | -------------- | --------------------------------------------------- |
| 1.0     | April 18, 2026 | Initial design documentation created                |
|         |                | • DESIGN_GUIDE.md (11 sections)                     |
|         |                | • BRAND_STYLE_REFERENCE.md (quick lookup)           |
|         |                | • COMPONENT_IMPLEMENTATION_GUIDE.md (code examples) |
|         |                | • README.md (this overview)                         |

---

## 📝 Document Metadata

- **Created**: April 18, 2026
- **Last Updated**: April 18, 2026
- **Version**: 1.0
- **Maintained By**: SheroTech Design System Team
- **Status**: ✅ Active

---

**Start exploring:** Pick a guide above and start building beautiful, consistent, accessible interfaces! 🎨
