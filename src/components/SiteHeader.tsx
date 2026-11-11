import { Icon } from "@/components/Icon";

export function SiteHeader() {
  return (
    <header className="site-header">
      <a className="brand" href="#top" aria-label="Omugwo home">
        <span className="brand-mark" aria-hidden="true">
          O
        </span>
        <span>
          <strong>Omugwo</strong>
          <small>The Season Mother Came</small>
        </span>
      </a>

      <nav className="site-nav" aria-label="Main navigation">
        <a href="#story">The story</a>
        <a href="#sample">Read a sample</a>
        <a href="#editions">Editions</a>
        <a href="#faq">FAQ</a>
      </nav>

      <a className="button button--header" href="#editions">
        <Icon name="book" />
        Buy the Book
        <Icon name="arrow-right" />
      </a>
    </header>
  );
}
