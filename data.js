const generateDatasets = (width, height) => {
  // так как запускаться может на разных компах с разным разрешением

  // примеры будут создаваться примерно в середине
  const centerX = width / 2;
  const centerY = height / 2;
  
  const spread = Math.min(width, height) / 3;
  
  return {
    linearSeparable: [
      { x: centerX - spread/2, y: centerY - spread/2, class: 1 },
      { x: centerX - spread/3, y: centerY - spread/3, class: 1 },
      { x: centerX - spread/4, y: centerY - spread/4, class: 1 },
      { x: centerX - spread/1.5, y: centerY - spread/1.5, class: 1 },
      { x: centerX + spread/2, y: centerY + spread/2, class: -1 },
      { x: centerX + spread/3, y: centerY + spread/3, class: -1 },
      { x: centerX + spread/4, y: centerY + spread/4, class: -1 },
      { x: centerX + spread/1.5, y: centerY + spread/1.5, class: -1 }
    ],
    
    circular: [
      { x: centerX + spread/4, y: centerY, class: 1 },
      { x: centerX + spread/5.6, y: centerY + spread/5.6, class: 1 }, 
      { x: centerX, y: centerY + spread/4, class: 1 },
      { x: centerX - spread/5.6, y: centerY + spread/5.6, class: 1 },
      { x: centerX - spread/4, y: centerY, class: 1 },
      { x: centerX - spread/5.6, y: centerY - spread/5.6, class: 1 },
      { x: centerX, y: centerY - spread/4, class: 1 },
      { x: centerX + spread/5.6, y: centerY - spread/5.6, class: 1 },
      { x: centerX + spread/1.5, y: centerY, class: -1 },
      { x: centerX + spread/1.7, y: centerY + spread/3, class: -1 },
      { x: centerX + spread/3, y: centerY + spread/1.7, class: -1 },
      { x: centerX, y: centerY + spread/1.5, class: -1 },
      { x: centerX - spread/3, y: centerY + spread/1.7, class: -1 },
      { x: centerX - spread/1.7, y: centerY + spread/3, class: -1 },
      { x: centerX - spread/1.5, y: centerY, class: -1 },
      { x: centerX - spread/1.7, y: centerY - spread/3, class: -1 },
      { x: centerX - spread/3, y: centerY - spread/1.7, class: -1 },
      { x: centerX, y: centerY - spread/1.5, class: -1 },
      { x: centerX + spread/3, y: centerY - spread/1.7, class: -1 },
      { x: centerX + spread/1.7, y: centerY - spread/3, class: -1 } 
    ],
    
    spiral: [
      { x: centerX, y: centerY, class: 1 },                          
      { x: centerX + spread/5, y: centerY, class: 1 },               
      { x: centerX + spread/4, y: centerY + spread/4, class: 1 },    
      { x: centerX, y: centerY + spread/3, class: 1 },               
      { x: centerX - spread/3, y: centerY + spread/4, class: 1 },    
      { x: centerX - spread/2, y: centerY, class: 1 },               
      { x: centerX - spread/3, y: centerY - spread/2, class: 1 },    
      { x: centerX, y: centerY - spread/1.5, class: 1 },             
      { x: centerX + spread/2, y: centerY - spread/1.5, class: 1 },  
      { x: centerX + spread/1.5, y: centerY - spread/3, class: 1 },  
      { x: centerX, y: centerY, class: -1 },                         
      { x: centerX - spread/5, y: centerY, class: -1 },              
      { x: centerX - spread/4, y: centerY - spread/4, class: -1 },   
      { x: centerX, y: centerY - spread/3, class: -1 },              
      { x: centerX + spread/3, y: centerY - spread/4, class: -1 },   
      { x: centerX + spread/2, y: centerY, class: -1 },              
      { x: centerX + spread/3, y: centerY + spread/2, class: -1 },   
      { x: centerX, y: centerY + spread/1.5, class: -1 },            
      { x: centerX - spread/2, y: centerY + spread/1.5, class: -1 }, 
      { x: centerX - spread/1.5, y: centerY + spread/3, class: -1 }  
    ],
    
    polynomial: [
      { x: centerX - spread/2, y: centerY - spread/4, class: 1 },
      { x: centerX - spread/4, y: centerY - spread/8, class: 1 },
      { x: centerX, y: centerY, class: 1 },
      { x: centerX + spread/4, y: centerY - spread/8, class: 1 },
      { x: centerX + spread/2, y: centerY - spread/4, class: 1 },
      { x: centerX - spread/3, y: centerY + spread/3, class: -1 },
      { x: centerX, y: centerY + spread/4, class: -1 },
      { x: centerX + spread/3, y: centerY + spread/3, class: -1 }
    ],

    xor: [
      { x: centerX + spread/3, y: centerY - spread/3, class: 1 },
      { x: centerX + spread/2, y: centerY - spread/2, class: 1 },
      { x: centerX - spread/3, y: centerY + spread/3, class: 1 },
      { x: centerX - spread/2, y: centerY + spread/2, class: 1 },
      { x: centerX - spread/3, y: centerY - spread/3, class: -1 },
      { x: centerX - spread/2, y: centerY - spread/2, class: -1 },
      { x: centerX + spread/3, y: centerY + spread/3, class: -1 },
      { x: centerX + spread/2, y: centerY + spread/2, class: -1 }
    ]
  };
};