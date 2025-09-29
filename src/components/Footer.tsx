import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faFacebook, 
  faInstagram, 
  faYoutube 
} from '@fortawesome/free-brands-svg-icons';

const Footer = () => {
  return (
    <footer className="bg-gray-700">
      {/* White separator line */}
      <div className="h-1 bg-white"></div>
      
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
          {/* Left side - Logo */}
          <div className="text-center lg:text-left">
            <div className="flex items-center justify-center lg:justify-start space-x-3">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                <img src="/logo.svg" alt="Mytec" className="h-8 w-auto" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">
                  <span className="text-white italic" style={{ fontFamily: 'serif' }}>Mytec</span>
                </h3>
              </div>
            </div>
          </div>

          {/* Middle section - Navigation Links */}
          <div className="text-center">
            <div className="flex flex-wrap justify-center space-x-6 lg:space-x-8">
              <a href="#" className="text-white text-sm uppercase tracking-wide hover:text-orange-400 transition-colors">
                Contact
              </a>
              <a href="#" className="text-white text-sm uppercase tracking-wide hover:text-orange-400 transition-colors">
                Services
              </a>
              <a href="#" className="text-white text-sm uppercase tracking-wide hover:text-orange-400 transition-colors">
                FAQ
              </a>
              <a href="#" className="text-white text-sm uppercase tracking-wide hover:text-orange-400 transition-colors">
                Privacy & Policy
              </a>
            </div>
          </div>

          {/* Right side - Social Media Icons */}
          <div className="text-center lg:text-right">
            <div className="flex justify-center lg:justify-end space-x-4">
              <a 
                href="#" 
                className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center hover:bg-orange-400 transition-colors"
              >
                <FontAwesomeIcon icon={faFacebook} className="text-white text-lg" />
              </a>
              <a 
                href="#" 
                className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center hover:bg-orange-400 transition-colors"
              >
                <FontAwesomeIcon icon={faInstagram} className="text-white text-lg" />
              </a>
              <a 
                href="#" 
                className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center hover:bg-orange-400 transition-colors"
              >
                <FontAwesomeIcon icon={faYoutube} className="text-white text-lg" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
