const trainSVM = (points, canvasWidth, canvasHeight, options = {}) => {
    const maxIterations = options.maxIterations || 2000;
    const learningRate = options.learningRate || 0.0001;
    const regularization = options.C || 1.0;

    let meanX = 0;
    let meanY = 0;

    points.forEach(point => {
        meanX += point.x;
        meanY += point.y;
    });

    meanX /= points.length;
    meanY /= points.length;

    let stdX = 0;
    let stdY = 0;

    points.forEach(point => {
        stdX += (point.x - meanX) ** 2;
        stdY += (point.y - meanY) ** 2;
    });

    stdX = Math.sqrt(stdX / points.length);
    stdY = Math.sqrt(stdY / points.length);

    const normalizedPoints = points.map(point => ({
        x: (point.x - meanX) / stdX,
        y: (point.y - meanY) / stdY,
        class: point.class
    }));

    let weights = [0, 0]; 
    let bias = 0;
    let lambdas = new Array(points.length).fill(0);

    let bestWeights = [...weights];
    let bestBias = bias;
    let smallestError = Infinity;

    for (let iteration = 0; iteration < maxIterations; iteration++) {
        let totalError = 0;

        const indices = Array.from({length: points.length}, (_, i) => i);
        for (let i = indices.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [indices[i], indices[j]] = [indices[j], indices[i]];
        }

        indices.forEach(i => {
            const point = normalizedPoints[i];
            
            const prediction = weights[0] * point.x + weights[1] * point.y + bias;
            
            const margin = point.class * prediction;

            if (margin < 1) {
                weights[0] += learningRate * (point.class * point.x - regularization * weights[0]);
                weights[1] += learningRate * (point.class * point.y - regularization * weights[1]);
                bias += learningRate * point.class;
                
                lambdas[i] += learningRate;

                totalError += 1 - margin;
            }
        });

        if (totalError < smallestError) {
            smallestError = totalError;
            bestWeights = [...weights];
            bestBias = bias;
        }

        if (totalError < 0.001) {
            break;
        }
    }

    const finalWeights = [
        bestWeights[0] / stdX,
        bestWeights[1] / stdY
    ];
    const finalBias = bestBias - (finalWeights[0] * meanX + finalWeights[1] * meanY);

    return {
        w: finalWeights,
        b: finalBias,
        lambdas: lambdas
    };
};