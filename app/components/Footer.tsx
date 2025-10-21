import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="py-4 text-center text-sm text-gray-600 mt-auto">
      <div className="container mx-auto">
        <p>
          © {new Date().getFullYear()} <a href="https://ceala.co.uk/" className="text-blue-600 hover:underline">Ceala Digital Limited</a>. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;