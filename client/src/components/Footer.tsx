import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-hotel-dark text-gray-300 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-3">
              <img src="/logo.svg" alt="Finitix Solution" className="h-10 w-auto bg-white rounded-lg px-2 py-1" />
              <span className="text-white font-display text-xl font-bold">Finitix Solution</span>
            </Link>
            <p className="text-sm text-gray-400 mb-3">
              ATTHERATE STORE SDN. BHD. (1263351-U)<br />
              B-03A-08, Street Mall One South, Serdang Perdana 6,<br />
              43300 Seri Kembangan, Selangor
            </p>
            <p className="text-sm text-gray-400">
              Experience fine dining in the comfort of your room. Order from our curated menu and enjoy fast delivery.
            </p>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-3">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/menu" className="hover:text-primary-400 transition-colors">Our Menu</Link></li>
              <li><Link to="/cart" className="hover:text-primary-400 transition-colors">Your Cart</Link></li>
              <li><Link to="/track" className="hover:text-primary-400 transition-colors">Track Order</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-3">Contact</h3>
            <ul className="space-y-2 text-sm">
              <li>Land: <a href="tel:+60350209817" className="hover:text-primary-400">+60 350209817</a></li>
              <li>Mob: <a href="tel:+601137356004" className="hover:text-primary-400">+601137356004</a></li>
              <li>Mail: <a href="mailto:finitixsolution@gmail.com" className="hover:text-primary-400">finitixsolution@gmail.com</a></li>
              <li>Web: <a href="https://finitixsolution.com" target="_blank" rel="noreferrer" className="hover:text-primary-400">finitixsolution.com</a></li>
              <li>Room Service: Available 24/7</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-6 text-center text-sm text-gray-500 space-y-1">
          <div>Finitix Solution - ATTHERATE STORE SDN. BHD. (1263351-U). Cash on Delivery only.</div>
          <div>&copy; {new Date().getFullYear()} <a href="https://stratixagency.site" target="_blank" rel="noreferrer" className="hover:text-primary-400 underline">Stratix</a>. All rights reserved.</div>
          <div>Powered by <a href="https://stratixagency.site" target="_blank" rel="noreferrer" className="text-gray-300 font-semibold hover:text-primary-400">Stratix AI</a></div>
        </div>
      </div>
    </footer>
  );
}
