import { AllCommunityModule, ModuleRegistry, themeQuartz } from "ag-grid-community";

// AG Grid Community completo, registrado una sola vez para toda la aplicación.
ModuleRegistry.registerModules([AllCommunityModule]);

/**
 * Tema del grid alimentado por los tokens de index.css.
 * Si cambian los colores o la fuente en index.css, el grid cambia solo.
 */
export const temaGrid = themeQuartz.withParams({
  fontFamily: "var(--font-sans)",
  fontSize: "var(--text-small)",
  accentColor: "var(--color-accent)",
  foregroundColor: "var(--color-ink)",
  backgroundColor: "var(--color-surface)",
  borderColor: "var(--color-line)",
  headerBackgroundColor: "var(--color-surface-2)",
  headerTextColor: "var(--color-muted)",
  headerFontSize: "var(--text-micro)",
  headerFontWeight: 700,
  oddRowBackgroundColor: "var(--color-surface)",
  rowHoverColor: "color-mix(in srgb, var(--color-accent) 6%, white)",
  selectedRowBackgroundColor: "color-mix(in srgb, var(--color-accent) 12%, white)",
  wrapperBorderRadius: 12,
  headerHeight: 40,
  rowHeight: 38,
  cellHorizontalPadding: 12,
  spacing: 6
});
