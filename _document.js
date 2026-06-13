import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <meta charSet="utf-8" />
        <meta name="description" content="Paste any conversation. Find out what they actually meant. AI-powered conversation decoder." />
        <meta property="og:title"       content="Said Different — Conversation Decoder" />
        <meta property="og:description" content="What they said. What they meant. They're rarely the same." />
        <meta property="og:type"        content="website" />
        <meta property="og:image"       content="/og.svg" />
        <meta name="twitter:card"       content="summary_large_image" />
        <meta name="twitter:title"      content="Said Different" />
        <meta name="twitter:description" content="What they said. What they meant. They're rarely the same 💀" />
        <meta name="theme-color"        content="#080010" />
        <link
          rel="icon"
          href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🔮</text></svg>"
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400&display=swap"
          rel="stylesheet"
        />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
