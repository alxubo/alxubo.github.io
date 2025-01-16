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
    ],

    linearRegularization: [
      { x: centerX - spread/3, y: centerY - spread/3, class: 1 },
      { x: centerX - spread/2.8, y: centerY - spread/2.8, class: 1 },
      { x: centerX - spread/2.6, y: centerY - spread/2.6, class: 1 },
      { x: centerX - spread/2.4, y: centerY - spread/2.4, class: 1 },
      { x: centerX - spread/4, y: centerY + spread/6, class: 1 },
      
      { x: centerX + spread/3, y: centerY + spread/3, class: -1 },
      { x: centerX + spread/2.8, y: centerY + spread/2.8, class: -1 },
      { x: centerX + spread/2.6, y: centerY + spread/2.6, class: -1 },
      { x: centerX + spread/2.4, y: centerY + spread/2.4, class: -1 }
    ],


    linearIterations: [
    { x: centerX - spread/2.2, y: centerY - spread/2.2, class: 1 },
    { x: centerX - spread/2.3, y: centerY - spread/2, class: 1 },
    { x: centerX - spread/2.1, y: centerY - spread/2.1, class: 1 },
    { x: centerX - spread/2, y: centerY - spread/2.3, class: 1 },
    { x: centerX - spread/1.9, y: centerY - spread/2.2, class: 1 },
    { x: centerX - spread/2.2, y: centerY - spread/1.9, class: 1 },
    
    { x: centerX - spread/4, y: centerY - spread/4, class: 1 },
    { x: centerX - spread/3.8, y: centerY - spread/4.2, class: 1 },
    { x: centerX - spread/4.2, y: centerY - spread/3.8, class: 1 },
    { x: centerX - spread/3.9, y: centerY - spread/4.1, class: 1 },
    { x: centerX - spread/4.1, y: centerY - spread/3.9, class: 1 },
    
    { x: centerX - spread/6, y: centerY - spread/6, class: 1 },
    { x: centerX - spread/5.8, y: centerY - spread/6.2, class: 1 },
    { x: centerX - spread/6.2, y: centerY - spread/5.8, class: 1 },
    { x: centerX - spread/5.9, y: centerY - spread/6.1, class: 1 },
    
    { x: centerX + spread/2.2, y: centerY + spread/2.2, class: -1 },
    { x: centerX + spread/2.3, y: centerY + spread/2, class: -1 },
    { x: centerX + spread/2.1, y: centerY + spread/2.1, class: -1 },
    { x: centerX + spread/2, y: centerY + spread/2.3, class: -1 },
    { x: centerX + spread/1.9, y: centerY + spread/2.2, class: -1 },
    { x: centerX + spread/2.2, y: centerY + spread/1.9, class: -1 },
    { x: centerX + spread/4, y: centerY + spread/4, class: -1 },
    { x: centerX + spread/3.8, y: centerY + spread/4.2, class: -1 },
    { x: centerX + spread/4.2, y: centerY + spread/3.8, class: -1 },
    { x: centerX + spread/3.9, y: centerY + spread/4.1, class: -1 },
    { x: centerX + spread/4.1, y: centerY + spread/3.9, class: -1 },
    { x: centerX + spread/6, y: centerY + spread/6, class: -1 },
    { x: centerX + spread/5.8, y: centerY + spread/6.2, class: -1 },
    { x: centerX + spread/6.2, y: centerY + spread/5.8, class: -1 },
    { x: centerX + spread/5.9, y: centerY + spread/6.1, class: -1 },
    { x: centerX - spread/10, y: centerY - spread/10, class: 1 },
    { x: centerX + spread/10, y: centerY + spread/10, class: -1 },
    { x: centerX - spread/12, y: centerY - spread/12, class: 1 },
    { x: centerX + spread/12, y: centerY + spread/12, class: -1 }
  ],
  };
};