import DOMPurify from "dompurify";

const ALLOWED_TAGS = [
  "p", "br", "b", "i", "em", "strong", "span", "div",
  "h1", "h2", "h3", "h4", "h5", "h6",
  "blockquote", "ul", "ol", "li", "a", "sup", "sub",
];
const ALLOWED_ATTR = ["class", "href", "target", "rel"];

export function sanitizeHTML(html: string): string {
  if (typeof window === "undefined") return html;
  return DOMPurify.sanitize(html, { ALLOWED_TAGS, ALLOWED_ATTR });
}
