/**
 * Quiet-luxe + gold palette for the marketing surface (home, features,
 * how-it-works, faq). Espresso-black ground, bone text, gold reserved for
 * key numbers + CTAs. Shared across every marketing page so the look is
 * locked and consistent.
 */
export const C = {
  bg:        '#0C0B0A',
  text:      '#EDE9E1',
  dim:       'rgba(237,233,225,0.55)',
  faint:     'rgba(237,233,225,0.34)',
  ghost:     'rgba(237,233,225,0.2)',
  gold:      '#C9A24B',
  goldSoft:  'rgba(201,162,75,0.7)',
  goldFaint: 'rgba(201,162,75,0.12)',
  goldLine:  'rgba(201,162,75,0.22)',
  taupe:     '#6E675B',
  line:      'rgba(237,233,225,0.09)',
  lineFaint: 'rgba(237,233,225,0.05)',
  surface:   'rgba(237,233,225,0.022)',
  surfaceBorder: 'rgba(237,233,225,0.08)',
  pos:       '#8A9A5B', /* muted olive — positive   */
  neg:       '#B5563F', /* warm brick — alert / down */
}

export type Palette = typeof C
