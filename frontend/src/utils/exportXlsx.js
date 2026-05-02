import * as XLSX from 'xlsx';

function saveWorkbook(wb, filename) {
  XLSX.writeFile(wb, filename);
}

export function exportOrdersXlsx(orders) {
  const rows = orders.map(o => ({
    'Order ID': `#${o.id}`,
    'Customer': o.shipping_name,
    'Phone': o.shipping_phone,
    'City': o.shipping_city,
    'Address': o.shipping_address,
    'Items': o.items?.length || 0,
    'Total (IDR)': Number(o.total_amount),
    'Status': o.status,
    'Midtrans ID': o.midtrans_order_id || '-',
    'Date': new Date(o.created_at).toLocaleDateString('id-ID'),
  }));

  const ws = XLSX.utils.json_to_sheet(rows);
  ws['!cols'] = [
    { wch: 10 }, { wch: 24 }, { wch: 16 }, { wch: 16 },
    { wch: 36 }, { wch: 8 }, { wch: 18 }, { wch: 10 },
    { wch: 28 }, { wch: 14 },
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Orders');
  saveWorkbook(wb, `Orders_Export_${new Date().toISOString().slice(0, 10)}.xlsx`);
}

export function exportProductsXlsx(products) {
  const productRows = products.map(p => ({
    'Product ID': p.id,
    'Name': p.name,
    'Brand': p.brand || '-',
    'Gender': p.gender || '-',
    'Total Stock': p.variants?.reduce((s, v) => s + v.stock, 0) || 0,
    'Min Price (IDR)': p.variants?.length ? Math.min(...p.variants.map(v => Number(v.price))) : 0,
    'Max Price (IDR)': p.variants?.length ? Math.max(...p.variants.map(v => Number(v.price))) : 0,
    'Variant Count': p.variants?.length || 0,
  }));

  const variantRows = [];
  products.forEach(p => {
    (p.variants || []).forEach(v => {
      variantRows.push({
        'Product': p.name,
        'Brand': p.brand || '-',
        'Color': v.color,
        'Size (EU)': v.size,
        'Stock': v.stock,
        'Price (IDR)': Number(v.price),
      });
    });
  });

  const wsProducts = XLSX.utils.json_to_sheet(productRows);
  wsProducts['!cols'] = [
    { wch: 10 }, { wch: 28 }, { wch: 14 }, { wch: 10 },
    { wch: 12 }, { wch: 16 }, { wch: 16 }, { wch: 14 },
  ];

  const wsVariants = XLSX.utils.json_to_sheet(variantRows);
  wsVariants['!cols'] = [
    { wch: 28 }, { wch: 14 }, { wch: 14 }, { wch: 10 }, { wch: 8 }, { wch: 16 },
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, wsProducts, 'Products');
  XLSX.utils.book_append_sheet(wb, wsVariants, 'Variants');
  saveWorkbook(wb, `Products_Export_${new Date().toISOString().slice(0, 10)}.xlsx`);
}

export function exportUsersXlsx(users) {
  const rows = users.map(u => ({
    'ID': u.id,
    'Username': u.username,
    'Email': u.email || '-',
    'Role': u.is_superuser ? 'Superadmin' : u.is_staff ? 'Staff' : 'User',
    'Status': u.is_active ? 'Active' : 'Inactive',
    'Last Login': u.last_login ? new Date(u.last_login).toLocaleDateString('id-ID') : 'Never',
    'Joined': new Date(u.date_joined).toLocaleDateString('id-ID'),
  }));

  const ws = XLSX.utils.json_to_sheet(rows);
  ws['!cols'] = [
    { wch: 6 }, { wch: 20 }, { wch: 28 }, { wch: 12 },
    { wch: 10 }, { wch: 14 }, { wch: 14 },
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Users');
  saveWorkbook(wb, `Users_Export_${new Date().toISOString().slice(0, 10)}.xlsx`);
}
