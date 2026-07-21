import { Utensils } from "lucide-react";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-hotel-dark text-gray-300 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <Link to="/" className="flex items-center gap-2 text-white font-display text-xl font-bold mb-3">
              <Utensils className="w-5 h-5" />
              Sana Hotel
            </Link>
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
              <li>Phone: +92-300-0000000</li>
              <li>Email: info@sana-hotel.com</li>
              <li>Room Service: Available 24/7</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-6 text-center text-sm text-gray-500">
          &copy; {new Date().getFullYear()} Sana Hotel. All rights reserved. Cash on Delivery only.
        </div>
      </div>
    </footer>
  );
}
