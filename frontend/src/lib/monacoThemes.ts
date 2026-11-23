import type { Monaco } from '@monaco-editor/react'

export const hex6 = (value: unknown, tokenName: string): string => {
  if (typeof value !== 'string' || !/^#?[0-9a-fA-F]{6}$/.test(value)) {
    throw new Error(`Bad Monaco colour for "${tokenName}": "${String(value)}"`)
  }
  return value.replace(/^#/, '')
}

const darkPalette = {
  background: '#0A0F1C',
  foreground: '#EEF1F8',
  comment: '#9AA7C4',
  keyword: '#5B7CFA',
  string: '#8FD0F0',
  number: '#C8D1E4',
  type: '#8FD0F0',
  function: '#EEF1F8',
  operator: '#A9B6D6',
  cursor: '#5B7CFA',
  selection: '#5B7CFA40',
  lineHighlight: '#1A2440',
}

const lightPalette = {
  background: '#FFFFFF',
  foreground: '#141B34',
  comment: '#58658A',
  keyword: '#2F55D4',
  string: '#0B6E99',
  number: '#424D6D',
  type: '#0B6E99',
  function: '#141B34',
  operator: '#58658A',
  cursor: '#2F55D4',
  selection: '#2F55D430',
  lineHighlight: '#F8F9FD',
}

const tokenRules = (palette: typeof darkPalette) => [
  { token: 'comment', foreground: hex6(palette.comment, 'comment'), fontStyle: 'italic' },
  { token: 'keyword', foreground: hex6(palette.keyword, 'keyword') },
  { token: 'string', foreground: hex6(palette.string, 'string') },
  { token: 'number', foreground: hex6(palette.number, 'number') },
  { token: 'type', foreground: hex6(palette.type, 'type') },
  { token: 'function', foreground: hex6(palette.function, 'function') },
  { token: 'variable', foreground: hex6(palette.foreground, 'variable') },
  { token: 'operator', foreground: hex6(palette.operator, 'operator') },
  { token: 'delimiter', foreground: hex6(palette.operator, 'delimiter') },
  { token: 'constant', foreground: hex6(palette.number, 'constant') },
]

export const defineCodeCompactThemes = (monaco: Monaco) => {
  monaco.editor.defineTheme('cc-dark', {
    base: 'vs-dark',
    inherit: true,
    rules: tokenRules(darkPalette),
    colors: {
      'editor.background': darkPalette.background,
      'editor.foreground': darkPalette.foreground,
      'editorLineNumber.foreground': '#6B7A99',
      'editorLineNumber.activeForeground': darkPalette.foreground,
      'editor.lineHighlightBackground': darkPalette.lineHighlight,
      'editor.selectionBackground': darkPalette.selection,
      'editorCursor.foreground': darkPalette.cursor,
      'editorIndentGuide.background1': '#33415F',
      'editorGutter.background': darkPalette.background,
      'editorWidget.background': '#151E31',
      'scrollbarSlider.background': '#6B7A994D',
    },
  })
  monaco.editor.defineTheme('cc-light', {
    base: 'vs',
    inherit: true,
    rules: tokenRules(lightPalette),
    colors: {
      'editor.background': lightPalette.background,
      'editor.foreground': lightPalette.foreground,
      'editorLineNumber.foreground': '#7A869F',
      'editorLineNumber.activeForeground': lightPalette.foreground,
      'editor.lineHighlightBackground': lightPalette.lineHighlight,
      'editor.selectionBackground': lightPalette.selection,
      'editorCursor.foreground': lightPalette.cursor,
      'editorIndentGuide.background1': '#D9DEEA',
      'editorGutter.background': lightPalette.background,
      'editorWidget.background': '#FFFFFF',
      'scrollbarSlider.background': '#7A869F4D',
    },
  })
}
