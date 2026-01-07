import React from 'react';

export default function CheckoutFilter({setFilterType, filterType}) {
  return (
    <div>
      <select
                className="border border-slate-300 rounded-md py-1.5 px-2 text-sm text-slate-600  outline-none focus:ring-2 focus:ring-blue-500"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <option value="all">All Products</option>
                <optgroup label="Price">
                  <option value="lowToHigh">Price: Low to High</option>
                  <option value="highToLow">Price: High to Low</option>
                </optgroup>
                <optgroup label="Size">
                  <option value="XS">Size: XS</option>
                  <option value="S">Size: S</option>
                  <option value="M">Size: M</option>
                  <option value="L">Size: L</option>
                  <option value="XL">Size: XL</option>
                </optgroup>

                <optgroup label="Color">
                  <option value="Red">Color: Red</option>
                  <option value="Blue">Color: Blue</option>
                  <option value="Black">Color: Black</option>
                  <option value="White">Color: White</option>
                  <option value="Khaki">Color: Khaki</option>
                  <option value="Maroon">Color: Maroon</option>
                  <option value="Dark Brown">Color: Dark Brown</option>
                  <option value="Pink">Color: Pink</option>
                </optgroup>
              </select>
    </div>
  );
}
