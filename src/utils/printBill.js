export const printBill = (transaction, isCheckout = false, cart = []) => {
  const items = isCheckout ? cart : transaction.items;
  const txnId = transaction.id || `TXN-${Date.now()}`;
  const date = transaction.date ? new Date(transaction.date).toLocaleString() : new Date().toLocaleString();
  const customerName = transaction.customer_name || "Guest Customer";
  const customerPhone = transaction.customer_phone || "-";
  const method = transaction.method || "Cash";
  
  // Calculate totals if not provided
  let subtotal = 0;
  let totalGst = 0;
  
  if (isCheckout && cart.length > 0) {
    subtotal = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);
    totalGst = cart.reduce((acc, item) => {
      const itemSubtotal = item.price * item.qty;
      return acc + (itemSubtotal * ((item.gst || 5) / 100));
    }, 0);
  } else if (items && items.length > 0) {
    subtotal = items.reduce((acc, item) => acc + ((item.price || 0) * (item.qty - (item.refunded_qty || 0))), 0);
    totalGst = items.reduce((acc, item) => {
      const itemSubtotal = (item.price || 0) * (item.qty - (item.refunded_qty || 0));
      return acc + (itemSubtotal * ((item.gst || 5) / 100));
    }, 0);
  }
  
  const amount = transaction.amount || (subtotal + totalGst);
  const discount = 0; // Would need to calculate from transaction if available

  const billHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Invoice - ${txnId}</title>
      <style>
        @page {
          size: 80mm auto;
          margin: 0;
        }
        body {
          font-family: 'Courier New', Courier, monospace;
          font-size: 12px;
          width: 80mm;
          margin: 0;
          padding: 5px;
          color: #000;
        }
        .header {
          text-align: center;
          margin-bottom: 10px;
        }
        .store-name {
          font-size: 16px;
          font-weight: bold;
        }
        .address {
          font-size: 10px;
          margin-bottom: 5px;
        }
        .divider {
          border-top: 1px dashed #000;
          margin: 8px 0;
        }
        .info-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 3px;
        }
        .info-label {
          font-weight: bold;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 10px 0;
        }
        th {
          text-align: left;
          border-bottom: 1px solid #000;
          padding: 2px 0;
        }
        td {
          padding: 2px 0;
        }
        .col-qty {
          width: 40px;
          text-align: center;
        }
        .col-price {
          width: 60px;
          text-align: right;
          padding-left: 8px;
        }
        .col-total {
          width: 65px;
          text-align: right;
          padding-left: 8px;
        }
        .totals {
          margin-top: 10px;
        }
        .total-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 3px;
        }
        .grand-total {
          font-size: 14px;
          font-weight: bold;
          border-top: 1px solid #000;
          padding-top: 5px;
        }
        .footer {
          text-align: center;
          margin-top: 15px;
          font-size: 10px;
        }
        .refund-notice {
          color: red;
          font-weight: bold;
          text-align: center;
          margin: 10px 0;
          padding: 5px;
          border: 1px dashed red;
        }
        @media print {
          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="store-name">CLASSIFABS</div>
        <div class="address">Fashion & Clothing Store</div>
      </div>
      
      <div class="divider"></div>
      
      <div class="info-row">
        <span class="info-label">Bill No:</span>
        <span>${txnId}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Date:</span>
        <span>${date}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Customer:</span>
        <span>${customerName}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Phone:</span>
        <span>${customerPhone}</span>
      </div>
      
      <div class="divider"></div>
      
      <table>
        <thead>
          <tr>
            <th>Item</th>
            <th class="col-qty">Qty</th>
            <th class="col-price">Rate</th>
            <th class="col-total">Amt</th>
          </tr>
        </thead>
        <tbody>
          ${items && items.length > 0 ? items.map(item => {
            const qty = isCheckout ? item.qty : (item.qty - (item.refunded_qty || 0));
            const price = item.price || 0;
            const total = qty * price;
            const itemName = item.product_name || item.name || item.id || "Item";
            return `
              <tr>
                <td>${itemName}</td>
                <td class="col-qty">${qty}</td>
                <td class="col-price">${price.toFixed(2)}</td>
                <td class="col-total">${total.toFixed(2)}</td>
              </tr>
            `;
          }).join('') : '<tr><td colspan="4" style="text-align:center">No items</td></tr>'}
        </tbody>
      </table>
      
      <div class="divider"></div>
      
      <div class="totals">
        <div class="total-row">
          <span>Subtotal:</span>
          <span>₹${subtotal.toFixed(2)}</span>
        </div>
        <div class="total-row">
          <span>GST (5%):</span>
          <span>₹${totalGst.toFixed(2)}</span>
        </div>
        ${discount > 0 ? `
        <div class="total-row">
          <span>Discount:</span>
          <span>-₹${discount.toFixed(2)}</span>
        </div>
        ` : ''}
        <div class="total-row grand-total">
          <span>TOTAL:</span>
          <span>₹${amount.toFixed(2)}</span>
        </div>
      </div>
      
      <div class="divider"></div>
      
      <div class="info-row">
        <span class="info-label">Payment:</span>
        <span>${method}</span>
      </div>
      
      ${transaction.status === 'Refunded' || transaction.status === 'Partially Refunded' ? `
      <div class="refund-notice">
        ${transaction.status === 'Refunded' ? 'FULLY REFUNDED' : 'PARTIALLY REFUNDED'}
        ${transaction.refund_reason ? `<br>Reason: ${transaction.refund_reason}` : ''}
      </div>
      ` : ''}
      
      <div class="footer">
        <p>Thank you for shopping with us!</p>
        <p>Please visit again</p>
      </div>
      
      <script>
        window.onload = function() {
          window.print();
          window.onafterprint = function() {
            window.close();
          };
        };
      </script>
    </body>
    </html>
  `;

  // Open print window
  const printWindow = window.open('', '_blank', 'width=400,height=600');
  if (printWindow) {
    printWindow.document.write(billHTML);
    printWindow.document.close();
  } else {
    alert('Please allow popups to print the bill');
  }
};

