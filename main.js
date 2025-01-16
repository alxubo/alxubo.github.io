document.addEventListener('DOMContentLoaded', () => {
    let canvas = document.getElementById('canvasForDrawing');
    let canvasContainer = document.querySelector('.canvas-container');
    let ctx = canvas.getContext('2d');
    let class1Btn = document.getElementById('class1Btn');
    let class2Btn = document.getElementById('class2Btn');
    let trainBtn = document.getElementById('trainBtn');
    let datasetSelect = document.getElementById('datasetSelect');
    let modeSelect = document.getElementById('modeSelect');
    let contextMenu = document.getElementById('contextMenu');
    
    let kernelSelect = document.getElementById('kernelSelect');
    let polyParams = document.getElementById('polyParams');
    let rbfParams = document.getElementById('rbfParams');
    let polyDegree = document.getElementById('polyDegree');
    let rbfGamma = document.getElementById('rbfGamma');
    let regularization = document.getElementById('regularization');
    let maxIterations = document.getElementById('maxIterations');

    let points = [];
    let currentClass = 1;
    let currentMode = 'add';
    let isDragging = false;
    let draggedPointIndex = null;
    let selectedPoint = null;
    let svmLine = null;
    let lambdas = [];

    const resizeCanvas = () => {
        let rect = canvasContainer.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;
        render();
    };

    const render = () => {
        clearCanvas(ctx);
        if (svmLine) {
            drawSVMLine(ctx, svmLine);
        }
        points.forEach((point, index) => {
            drawPoint(ctx, point, lambdas[index]);
        });
    };

    const calculateDistance = (x1, y1, x2, y2) => 
        Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2);

    const getPointAtPosition = (x, y) => {
        return points.findIndex(p => calculateDistance(p.x, p.y, x, y) < 10);
    };

    const init = () => {
        resizeCanvas();
        const datasets = generateDatasets(canvas.width, canvas.height);
        points = datasets.linearSeparable;
        render();
    };


    // тут начинаются listeners

    class1Btn.addEventListener('click', () => {
        currentClass = 1;
        class1Btn.classList.add('active');
        class2Btn.classList.remove('active');
    });

    class2Btn.addEventListener('click', () => {
        currentClass = -1;
        class2Btn.classList.add('active');
        class1Btn.classList.remove('active');
    });

    kernelSelect.addEventListener('change', (e) => {
        const kernel = e.target.value;
        polyParams.style.display = kernel === 'polynomial' ? 'block' : 'none';
        rbfParams.style.display = kernel === 'rbf' ? 'block' : 'none';
        svmLine = null;
        lambdas = [];
        render();
    });

    trainBtn.addEventListener('click', () => {
        if (points.length < 2) {
            alert('Please add at least 2 points (one from each class)');
            return;
        }

        let classes = new Set(points.map(p => p.class));
        if (classes.size !== 2) {
            alert('Please add points from both classes');
            return;
        }

        let kernel = kernelSelect.value;
        let options = {
            kernel: kernel,
            C: parseFloat(regularization.value),
            maxIterations: parseInt(maxIterations.value),
            kernelParams: {}
        };

        if (kernel === 'polynomial') {
            options.kernelParams.polynomial = parseInt(polyDegree.value);
        } else if (kernel === 'rbf') {
            options.kernelParams.rbf = parseFloat(rbfGamma.value);
        }

        try {
            let svm = new KernelSVM(options);
            let result = svm.train(points);
            
            if (kernel === 'linear' && result) {
                svmLine = result;
                lambdas = result.lambdas;
            } else {
                let grid = svm.generateDecisionBoundary(canvas.width, canvas.height);
                svmLine = { grid };
                lambdas = result.lambdas;
            }
            render();
            
        } catch (error) {
            alert('error');
        }
    });

    datasetSelect.addEventListener('change', (e) => {
        if (e.target.value) {
            let datasets = generateDatasets(canvas.width, canvas.height);
            points = datasets[e.target.value];
            svmLine = null;
            lambdas = [];
            render();
        }
    });

    modeSelect.addEventListener('change', (e) => {
        currentMode = e.target.value;
    });

    let handleContextMenu = (e) => {
        e.preventDefault();
        let rect = canvas.getBoundingClientRect();
        let x = e.clientX - rect.left;
        let y = e.clientY - rect.top;
        
        let pointIndex = getPointAtPosition(x, y);
        if (pointIndex !== -1) {
            selectedPoint = pointIndex;
            contextMenu.style.left = e.clientX + 'px';
            contextMenu.style.top = e.clientY + 'px';
            contextMenu.classList.add('active');
        }
    };

    document.addEventListener('click', () => {
        contextMenu.classList.remove('active');
    });

    contextMenu.addEventListener('click', (e) => {
        let action = e.target.dataset.action;
        if (action && selectedPoint !== null) {
            if (action === 'delete') {
                points.splice(selectedPoint, 1);
            } else if (action === 'changeClass') {
                points[selectedPoint].class *= -1;
            }
            svmLine = null;
            lambdas = [];
            render();
        }
        contextMenu.classList.remove('active');
    });

    canvas.addEventListener('mousedown', (e) => {
        let rect = canvas.getBoundingClientRect();
        let x = e.clientX - rect.left;
        let y = e.clientY - rect.top;
        let pointIndex = getPointAtPosition(x, y);

        if (currentMode === 'add' && pointIndex === -1) {
            points.push({ x, y, class: currentClass });
            svmLine = null;
            lambdas = [];
            render();
        } else if (currentMode === 'move' && pointIndex !== -1) {
            isDragging = true;
            draggedPointIndex = pointIndex;
        } else if (currentMode === 'delete' && pointIndex !== -1) {
            points.splice(pointIndex, 1);
            svmLine = null;
            lambdas = [];
            render();
        } else if (currentMode === 'changeClass' && pointIndex !== -1) {
            points[pointIndex].class *= -1;
            svmLine = null;
            lambdas = [];
            render();
        }
    });

    canvas.addEventListener('mousemove', (e) => {
        if (!isDragging || currentMode !== 'move') return;

        let rect = canvas.getBoundingClientRect();
        let x = e.clientX - rect.left;
        let y = e.clientY - rect.top;

        points[draggedPointIndex] = { ...points[draggedPointIndex], x, y };
        svmLine = null;
        lambdas = [];
        render();
    });

    canvas.addEventListener('mouseup', () => {
        isDragging = false;
        draggedPointIndex = null;
    });

    canvas.addEventListener('mouseleave', () => {
        isDragging = false;
        draggedPointIndex = null;
    });

    canvas.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('resize', resizeCanvas);
    setTimeout(init, 0);
});