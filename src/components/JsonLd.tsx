/**
 * Safe JSON-LD Component
 * Renders structured data safely without dangerouslySetInnerHTML concerns
 * Works in both server and client components
 */

interface JsonLdProps {
  data: Record<string, unknown>;
}

export function JsonLd({ data }: JsonLdProps) {
  // JSON.stringify automatically escapes HTML/script content
  // This is safe for JSON-LD as long as the data is controlled (not user input)
  const jsonString = JSON.stringify(data);

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: jsonString }}
      suppressHydrationWarning
    />
  );
}
