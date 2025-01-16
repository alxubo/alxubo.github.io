const drawPoint = (ctx, point, lambda = null) => {
    ctx.beginPath();
    ctx.arc(point.x, point.y, 10, 0, Math.PI * 2);
    ctx.fillStyle = point.class === 1 ? '#ef4444' : '#3b82f6';
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 3;
    ctx.stroke();

    if (lambda !== null) {
        ctx.fillStyle = '#fff';
        ctx.fillText(`lambda: ${lambda.toFixed(3)}`, point.x + 20, point.y);
    }
};

const drawSVMLine = (ctx, svmLine) => {
    if (!svmLine) {
        return;
    }

    if (svmLine.grid) {
        const secondCanvas = document.createElement('canvas');
        secondCanvas.width = ctx.canvas.width;
        secondCanvas.height = ctx.canvas.height;

        const secondCanvasContext = secondCanvas.getContext('2d');
        secondCanvasContext.fillStyle = '#1a1a1a';
        secondCanvasContext.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        
        svmLine.grid.forEach(point => {
            const confidence = Math.abs(point.value);
            const radius = 25; 
            const opacity = Math.min(Math.max(confidence * 0.8, 0.1), 0.95);
            
            secondCanvasContext.beginPath();
            secondCanvasContext.arc(point.x, point.y, radius, 0, Math.PI * 2);
            
            if (point.value > 0) {
                secondCanvasContext.fillStyle = `rgba(239, 68, 68, ${opacity})`;
            } else {
                secondCanvasContext.fillStyle = `rgba(59, 130, 246, ${opacity})`;
            }
            secondCanvasContext.fill();
        });
        
        secondCanvasContext.filter = 'blur(10px)';
        secondCanvasContext.drawImage(secondCanvas, 0, 0);
        
        ctx.drawImage(secondCanvas, 0, 0);
        return;
    }

    const { w, b } = svmLine;
    
    const y1 = (-w[0] * 0 - b) / w[1];
    const y2 = (-w[0] * ctx.canvas.width - b) / w[1];

    const gradient1 = ctx.createLinearGradient(0, 0, 0, ctx.canvas.height);
    gradient1.addColorStop(0, 'rgba(239, 68, 68, 0.1)');
    gradient1.addColorStop(1, 'rgba(239, 68, 68, 0.1)');
    
    const gradient2 = ctx.createLinearGradient(0, 0, 0, ctx.canvas.height);
    gradient2.addColorStop(0, 'rgba(59, 130, 246, 0.1)');
    gradient2.addColorStop(1, 'rgba(59, 130, 246, 0.1)');

    

    ctx.beginPath();
    ctx.moveTo(0, y1);
    ctx.lineTo(ctx.canvas.width, y2);
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, y1);
    ctx.lineTo(ctx.canvas.width, y2);
    ctx.lineTo(ctx.canvas.width, 0);
    ctx.lineTo(0, 0);
    ctx.closePath();
    ctx.fillStyle = gradient1;
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(0, y1);
    ctx.lineTo(ctx.canvas.width, y2);
    ctx.lineTo(ctx.canvas.width, ctx.canvas.height);
    ctx.lineTo(0, ctx.canvas.height);
    ctx.closePath();
    ctx.fillStyle = gradient2;
    ctx.fill();
    
    ctx.beginPath();
    ctx.setLineDash([5, 5]);
    ctx.moveTo(0, y1 + 1/w[1]);
    ctx.lineTo(ctx.canvas.width, y2 + 1/w[1]);
    ctx.moveTo(0, y1 - 1/w[1]);
    ctx.lineTo(ctx.canvas.width, y2 - 1/w[1]);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.setLineDash([]);
};

const clearCanvas = (ctx) => {
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
};