import React from 'react';
import '../styles/menuCliente.css'; // Asumiendo que tendrás un archivo de estilos

const Menu = () => {
  // Datos de ejemplo del menú
  const menuItems = [
    {
      category: 'Entradas',
      items: [
        { name: 'Ensalada Caprese', price: 8.50, description: 'Tomate, mozzarella y albahaca' },
        { name: 'Carpaccio de Res', price: 12.00, description: 'Finas láminas con parmesano' },
      ],
    },
    {
      category: 'Platos Principales',
      items: [
        { name: 'Pasta Alfredo', price: 14.00, description: 'Fettuccine con salsa cremosa' },
        { name: 'Pollo a la Parrilla', price: 16.50, description: 'Acompañado de vegetales' },
      ],
    },
    {
      category: 'Postres',
      items: [
        { name: 'Tiramisú', price: 6.00, description: 'Clásico postre italiano' },
        { name: 'Helado Artesanal', price: 5.00, description: 'Tres sabores a elegir' },
      ],
    },
  ];

  return (
    <div className="menu-container">
      <h1>Menú del Restaurante</h1>
      
      {menuItems.map((section, index) => (
        <div key={index} className="menu-section">
          <h2>{section.category}</h2>
          <div className="items-list">
            {section.items.map((item, itemIndex) => (
              <div key={itemIndex} className="menu-item">
                <div className="item-details">
                  <h3>{item.name}</h3>
                  <p>{item.description}</p>
                </div>
                <span className="price">${item.price.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Menu;