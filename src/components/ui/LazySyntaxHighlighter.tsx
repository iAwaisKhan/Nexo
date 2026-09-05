import React from 'react';
import type { SyntaxHighlighterProps } from 'react-syntax-highlighter';

export const LazySyntaxHighlighter = React.lazy(async () => {
  const [
    { default: PrismLight },
    { default: javascript },
    { default: typescript },
    { default: jsx },
    { default: tsx },
    { default: json },
    { default: bash },
    { default: css },
    { default: markup },
    { oneLight },
  ] = await Promise.all([
    import('react-syntax-highlighter/dist/esm/prism-light'),
    import('react-syntax-highlighter/dist/esm/languages/prism/javascript'),
    import('react-syntax-highlighter/dist/esm/languages/prism/typescript'),
    import('react-syntax-highlighter/dist/esm/languages/prism/jsx'),
    import('react-syntax-highlighter/dist/esm/languages/prism/tsx'),
    import('react-syntax-highlighter/dist/esm/languages/prism/json'),
    import('react-syntax-highlighter/dist/esm/languages/prism/bash'),
    import('react-syntax-highlighter/dist/esm/languages/prism/css'),
    import('react-syntax-highlighter/dist/esm/languages/prism/markup'),
    import('react-syntax-highlighter/dist/esm/styles/prism'),
  ]);

  PrismLight.registerLanguage('javascript', javascript);
  PrismLight.registerLanguage('js', javascript);
  PrismLight.registerLanguage('typescript', typescript);
  PrismLight.registerLanguage('ts', typescript);
  PrismLight.registerLanguage('jsx', jsx);
  PrismLight.registerLanguage('tsx', tsx);
  PrismLight.registerLanguage('json', json);
  PrismLight.registerLanguage('bash', bash);
  PrismLight.registerLanguage('shell', bash);
  PrismLight.registerLanguage('css', css);
  PrismLight.registerLanguage('html', markup);
  PrismLight.registerLanguage('markup', markup);

  return {
    default: (props: SyntaxHighlighterProps) => <PrismLight {...props} style={oneLight} />,
  };
});
