import Link from "next/link";

export default function Footer() {
  return (
    <footer className="hidden md:block max-w-7xl mx-auto px-6 py-20 border-t border-outline-variant/10 text-center lg:text-left">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
        <div className="md:col-span-2">
          <div className="mb-4">
            <img src="/bibleway-logo.png" alt="Bibleway" className="h-8 w-auto" />
          </div>
          <p className="text-on-surface-variant max-w-sm leading-relaxed">
            A modern sanctuary dedicated to the restoration of silence and the
            cultivation of faith through beautiful design.
          </p>
        </div>
        <div>
          <h6 className="font-bold text-[10px] uppercase tracking-widest text-primary mb-6">
            Explore
          </h6>
          <ul className="space-y-4 text-sm text-on-surface-variant">
            <li>
              <Link href="/" className="hover:text-primary transition-colors">
                Home
              </Link>
            </li>
            <li>
              <Link href="/bible" className="hover:text-primary transition-colors">
                Bible
              </Link>
            </li>
            <li>
              <Link href="/shop" className="hover:text-primary transition-colors">
                Shop
              </Link>
            </li>
            <li>
              <Link href="/chat" className="hover:text-primary transition-colors">
                Chat
              </Link>
            </li>
            <li>
              <Link href="/games" className="hover:text-primary transition-colors">
                Games
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h6 className="font-bold text-[10px] uppercase tracking-widest text-primary mb-6">
            Legal
          </h6>
          <ul className="space-y-4 text-sm text-on-surface-variant">
            <li>
              <Link href="#" className="hover:text-primary transition-colors">
                About Us
              </Link>
            </li>
            <li>
              <Link href="#" className="hover:text-primary transition-colors">
                Resources
              </Link>
            </li>
            <li>
              <Link href="#" className="hover:text-primary transition-colors">
                Privacy
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="mt-20 pt-8 border-t border-outline-variant/5 text-[10px] uppercase tracking-widest font-bold text-on-surface-variant/40">
        © {new Date().getFullYear()} Bibleway. All rights reserved.
      </div>
    </footer>
  );
}
