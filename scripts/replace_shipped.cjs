const fs = require('fs');
const path = require('path');

const filesToUpdate = [
  'src/views/TrackOrder.tsx',
  'src/views/CheckoutSuccess.tsx',
  'src/views/admin/AdminReports.tsx',
  'src/views/admin/AdminOrders.tsx',
  'src/lib/orderUtils.ts',
  'src/lib/notifications.ts',
  'src/app/api/orders/[id]/route.ts',
  'src/app/api/reports/order-status/route.ts',
  'src/views/admin/AdminUsers.tsx',
  'src/app/(public)/track/[orderId]/page.tsx',
  'src/views/admin/OrderDetails.tsx'
];

filesToUpdate.forEach(relPath => {
  const fullPath = path.join(process.cwd(), relPath);
  if (fs.existsSync(fullPath)) {
    let content = fs.readFileSync(fullPath, 'utf8');
    
    // Replace state string shipped with intransit
    content = content.replace(/"shipped"/g, '"intransit"');
    
    // Replace UI Label Shipped with In Transit
    content = content.replace(/>Shipped</g, '>In Transit<');
    content = content.replace(/} Shipped/g, '} In Transit');
    content = content.replace(/label: "Shipped"/g, 'label: "In Transit"');
    
    // Replace keys in objects
    content = content.replace(/shipped:/g, 'intransit:');
    
    // Replace text in notifications
    content = content.replace(/has been shipped and is on its way/g, 'has been dispatched and is in transit');
    content = content.replace(/order has shipped/gi, 'order is in transit');
    
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log('Updated ' + relPath);
  }
});
