# Theme Builder

## Purpose

The theme builder lets the restaurant owner customize the visual identity of the Arabic-first seafood website without editing code.

## Required Theme Controls

Admin can change:

- Primary color.
- Secondary color.
- Button color.
- Header color.
- Footer color.
- Logo.
- Favicon.
- Hero images.
- Homepage section visibility.

Admin can reorder homepage sections later if possible.

## Arabic-First Design Rules

- Arabic `/ar` pages are the primary design target.
- RTL spacing and alignment must remain correct after theme changes.
- English `/en` pages use the same theme with LTR layout.
- Color choices must preserve readability for Arabic and English text.

## Seafood Brand Direction

The first implementation should support a seafood visual identity:

- Fresh, clean colors.
- High-quality fish and seafood imagery.
- Clear price and menu presentation.
- Strong reservation and WhatsApp actions.

These visual choices should be configurable, not hardcoded permanently.

## Asset Rules

- Logo is editable from admin.
- Favicon is editable from admin.
- Hero images are editable from admin.
- Open Graph image can be managed through SEO or media settings.
- Media should come from the image library where possible.

## Guardrails

- Do not allow arbitrary unsafe CSS.
- Preserve accessible contrast.
- Preserve mobile-first layout.
- Preserve fast loading.
- Prevent theme changes from breaking public sections.

## Future Enhancements

- Theme presets.
- Seasonal themes.
- Theme preview before publish.
- Theme history and rollback.
- Section drag-and-drop ordering.
