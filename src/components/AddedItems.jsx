import React from 'react';

export default function AddedItems({ cart, updateQty, clearCart, discountValue = 0, discountType = "percent" }) {
  // Calculate total 
  // const grandTotal = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);
  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);

 
 const discountAmt = discountType === "percent" 
    ? subtotal * (parseFloat(discountValue || 0) / 100)
    : parseFloat(discountValue || 0);

  //  GST 
  const totalGst = cart.reduce((acc, item) => {
    const itemSubtotal = item.price * item.qty;
    const itemShare = subtotal > 0 ? (itemSubtotal / subtotal) * discountAmt : 0;
    const itemTaxable = Math.max(0, itemSubtotal - itemShare);
    return acc + (itemTaxable * ((item.gst || 5) / 100));
  }, 0);

  const grandTotal = Math.max(0, subtotal - discountAmt) + totalGst;

  

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <div className="flex justify-between items-end mb-6 border-b pb-2">
        <h2 className="text-3xl font-bold text-slate-800">Order Summary</h2>
        {cart.length > 0 && (
          <button 
            onClick={clearCart} 
            className="text-red-500 hover:text-red-700 hover:bg-red-50 px-2 py-1 rounded text-sm font-bold transition-colors"
            title="Clear all items from cart"
          >
            Clear All
          </button>
        )}
      </div>
      
      <div className="space-y-4 mb-6">
        {cart.length === 0 ? (
          <p className="text-slate-400 text-center py-4 italic text-sm font-medium">Click items on the left to add</p>
        ) : (
          cart.map((item) => (
            <div key={item.id} className="flex justify-between items-center font-medium text-sm bg-slate-50 p-2 rounded-lg">
              <div className="text-slate-600">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-slate-800">{item.name}</p>
                  {(item.color || item.size) && (
                    <div className="flex items-center gap-1.5 ml-2 px-2 py-0.5 bg-slate-200/50 rounded-md text-xs">
                      {item.color && item.color.toLowerCase() !== 'all' && item.color.toLowerCase() !== 'n/a' && (
                        <div 
                          className="w-3 h-3 rounded-sm border border-slate-300 shadow-[0_1px_2px_rgba(0,0,0,0.1)]"
                          style={{ backgroundColor: item.color.toLowerCase() }}
                          title={item.color}
                        />
                      )}
                      {item.size && item.size.toLowerCase() !== 'all' && item.size.toLowerCase() !== 'n/a' && (
                         <span className="font-bold text-slate-700">{item.size}</span>
                      )}
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-2">
                    {/* Decrease Qty */}
                    <button 
                      onClick={() => updateQty(item.id, -1)}
                      className="w-6 h-6 flex items-center justify-center bg-white border border-slate-300 rounded hover:bg-red-50 hover:text-red-600"
                    > - </button>
                    
                    <span className="font-bold text-slate-900 w-4 text-center">{item.qty}</span>
                    
                    {/* Increase Qty */}
                    <button 
                      onClick={() => updateQty(item.id, 1)}
                      disabled={item.qty >= item.stock_qty} 
                      className={`w-6 h-6 flex items-center justify-center border rounded transition-colors ${
                        item.qty >= item.stock_qty
                          ? "bg-slate-200 text-slate-400 border-slate-200 cursor-not-allowed" 
                          : "bg-white border-slate-300 hover:bg-green-50 hover:text-green-600"
                      }`}
                      title={item.qty >= item.stock_qty ? "Out of stock" : "Add more"}
                    > + </button>
                    
                    <span className="text-xs text-black ml-1"> ₹{item.price}</span>
                  </div>

                  {/* Remove Entire Item */}
                  <button 
                    onClick={() => updateQty(item.id, -item.qty)}
                    className="p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                    title="Remove item completely"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                 
                </div>
              </div>
              <span className="font-bold text-slate-900">₹{(item.qty * item.price).toFixed(2)}</span>
            </div>
          ))
        )}
      </div>

      {/* <div className="border-t pt-4 flex justify-between items-center">
        <span className="text-slate-500 text-md font-medium">Total Amount</span>
        <span className="text-2xl font-black text-blue-600">₹{grandTotal.toFixed(2)}</span>
      </div>
    </div> */}


      <div className="border-t pt-4 space-y-2">
      <div className="flex justify-between text-sm text-slate-600">
          <span>Subtotal</span>
          <span>₹{subtotal.toFixed(2)}</span>
        </div>

        {discountAmt > 0 && (
          <div className="flex justify-between text-sm text-green-600 font-bold bg-green-50 p-1 rounded">
            <span>Discount {discountType === "percent" ? `(${discountValue}%)` : ""}</span>
            <span>- ₹{discountAmt.toFixed(2)}</span>
          </div>
        )}

        <div className="flex justify-between text-sm text-slate-600">
          <span>Total GST </span>
          <span className="text-slate-800 font-medium">+ ₹{totalGst.toFixed(2)}</span>
        </div>


        <div className="flex justify-between items-center pt-2 border-t mt-2">
          <span className="text-slate-800 font-bold">Grand Total</span>
          <span className="text-2xl font-black text-blue-600">₹{grandTotal.toFixed(2)}</span>
        </div>
       
      </div>
    </div>
  );
}