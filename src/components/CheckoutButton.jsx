import React from 'react';

export default function CheckoutButton({onClick, disabled}) {
  return (
    <div>
       <button 
          className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-blue-700  shadow-md"
         onClick={onClick}
         disabled={disabled}
        >
          Checkout
        </button>
    </div>
  );
}
