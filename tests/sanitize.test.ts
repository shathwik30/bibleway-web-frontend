import { describe, it, expect } from "vitest";
import DOMPurify from "dompurify";
import { marked } from "marked";

function sanitizeHTML(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      "p", "br", "b", "i", "em", "strong", "span", "div",
      "h1", "h2", "h3", "h4", "h5", "h6", "blockquote",
      "ul", "ol", "li", "a", "sup", "sub",
    ],
    ALLOWED_ATTR: ["class", "href", "target", "rel"],
  });
}

describe("sanitizeHTML", () => {
  it("strips script tags completely", () => {
    const input = "<script>alert('xss')</script>";
    const result = sanitizeHTML(input);
    expect(result).not.toContain("<script");
    expect(result).not.toContain("alert");
  });

  it("strips event handler attributes from elements", () => {
    const input = '<p onclick="alert(\'xss\')">text</p>';
    const result = sanitizeHTML(input);
    expect(result).toBe("<p>text</p>");
  });

  it("preserves safe HTML with allowed tags and attributes", () => {
    const input = '<p class="verse"><strong>Bold</strong></p>';
    const result = sanitizeHTML(input);
    expect(result).toBe('<p class="verse"><strong>Bold</strong></p>');
  });

  it("strips img tags since they are not in allowed tags", () => {
    const input = '<img onerror="alert(1)" src=x>';
    const result = sanitizeHTML(input);
    expect(result).not.toContain("<img");
    expect(result).not.toContain("onerror");
  });

  it("sanitizes marked markdown output through the pipeline", async () => {
    const markdown = "**bold** text";
    const rawHTML = await marked(markdown);
    const result = sanitizeHTML(rawHTML);
    expect(result).toContain("<strong>bold</strong>");
    expect(result).toContain("text");
    expect(result).not.toContain("<script");
  });

  it("strips nested script inside allowed tags", () => {
    const input = '<div><script>document.cookie</script><p>safe</p></div>';
    const result = sanitizeHTML(input);
    expect(result).toContain("<p>safe</p>");
    expect(result).not.toContain("<script");
    expect(result).not.toContain("document.cookie");
  });

  it("strips javascript: protocol in href", () => {
    const input = '<a href="javascript:alert(1)">click</a>';
    const result = sanitizeHTML(input);
    expect(result).not.toContain("javascript:");
  });
});
