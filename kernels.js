const kernelFunctions = {
    linear: function(point1, point2) {
        return (point1[0] * point2[0]) + (point1[1] * point2[1]);
    },
    
    polynomial: function(point1, point2, parameters) {
        if (!parameters) {
            parameters = {};
        }

        if (!parameters.polynomial) {
            return Math.pow((point1[0] * point2[0] + point1[1] * point2[1]) + 1, 2);
        }

        return Math.pow((point1[0] * point2[0] + point1[1] * point2[1]) + 1, parameters.polynomial);
    },
    
    rbf: function(point1, point2, gammaParameter) {
        if (!gammaParameter) {
            gammaParameter = 1;
        }

        let euclideanDistance = (point1[0] - point2[0]) * (point1[0] - point2[0]) + (point1[1] - point2[1]) * (point1[1] - point2[1]);
        return Math.exp(-gammaParameter * euclideanDistance);
    }
};

class KernelSVM {
    constructor(options) {
        this.kernelType = options.kernel;
        this.regularizationParameter = options.C;
        this.maxIterations = options.maxIterations;
        this.tolerance = 0.001;
        this.epsilon = 0.000001;
        this.kernelParameters = options.kernelParams;
        
        this.lagrangeMultipliers = null;
        this.bias = 0;
        this.supportVectors = [];
        this.normalizedPoints = [];
        this.normalizationParameters = {};
    }
    
    train(dataPoints) {
        this.normalizedPoints = this.normalizeData(dataPoints);
        
        this.lagrangeMultipliers = new Array(this.normalizedPoints.length);

        for (let pointIndex = 0; pointIndex < this.normalizedPoints.length; pointIndex++) {
            this.lagrangeMultipliers[pointIndex] = 0.1 * Math.random();
        }
        
        this.bias = 0;

        let kernelMatrix = this.computeKernelMatrix(this.normalizedPoints);
        this.optimizeLagrangeMultipliers(kernelMatrix);

        if (this.kernelType === 'linear') {
            let weightVector = [0, 0];

            for (let pointIndex = 0; pointIndex < this.normalizedPoints.length; pointIndex++) {
                if (this.epsilon < Math.abs(this.lagrangeMultipliers[pointIndex])) {
                    weightVector[0] += this.lagrangeMultipliers[pointIndex] * this.normalizedPoints[pointIndex].class * this.normalizedPoints[pointIndex].x;
                    weightVector[1] += this.lagrangeMultipliers[pointIndex] * this.normalizedPoints[pointIndex].class * this.normalizedPoints[pointIndex].y;
                }
            }
            
            let denormalizedWeights = [
                weightVector[0] / this.normalizationParameters.stdX,
                weightVector[1] / this.normalizationParameters.stdY
            ];

            let denormalizedBias = this.bias - (
                denormalizedWeights[0] * this.normalizationParameters.meanX + 
                denormalizedWeights[1] * this.normalizationParameters.meanY
            );

            return {
                w: denormalizedWeights,
                b: denormalizedBias,
                lambdas: this.lagrangeMultipliers
            };
        }

        return {
            lambdas: this.lagrangeMultipliers
        };
    }

    normalizeData(dataPoints) {
        let meanX = 0;
        let meanY = 0;
        
        for (let pointIndex = 0; pointIndex < dataPoints.length; pointIndex++) {
            meanX += dataPoints[pointIndex].x;
            meanY += dataPoints[pointIndex].y;
        }

        meanX /= dataPoints.length;
        meanY /= dataPoints.length;

        let standardDeviationX = 1;
        let standardDeviationY = 1;
        
        if (dataPoints.length > 1) {
            let sumSquaredDiffX = 0;
            let sumSquaredDiffY = 0;
            
            for (let pointIndex = 0; pointIndex < dataPoints.length; pointIndex++) {
                sumSquaredDiffX += (dataPoints[pointIndex].x - meanX) * (dataPoints[pointIndex].x - meanX);
                sumSquaredDiffY += (dataPoints[pointIndex].y - meanY) * (dataPoints[pointIndex].y - meanY);
            }
            
            standardDeviationX = Math.sqrt(sumSquaredDiffX / dataPoints.length) || 1;
            standardDeviationY = Math.sqrt(sumSquaredDiffY / dataPoints.length) || 1;
        }

        this.normalizationParameters.meanX = meanX;
        this.normalizationParameters.meanY = meanY;
        this.normalizationParameters.stdX = standardDeviationX;
        this.normalizationParameters.stdY = standardDeviationY;

        let normalizedPoints = [];

        for (let pointIndex = 0; pointIndex < dataPoints.length; pointIndex++) {
            let currentPoint = dataPoints[pointIndex];

            normalizedPoints.push({
                x: (currentPoint.x - meanX) / standardDeviationX,
                y: (currentPoint.y - meanY) / standardDeviationY,
                class: currentPoint.class !== -1 ? 1 : -1
            });
        }

        return normalizedPoints;
    }

    computeKernelMatrix(dataPoints) {
        let numPoints = dataPoints.length;
        let kernelMatrix = new Array(numPoints);

        for (let rowIndex = 0; rowIndex < numPoints; rowIndex++) {
            kernelMatrix[rowIndex] = new Array(numPoints).fill(0);
        }
        
        for (let rowIndex = 0; rowIndex < numPoints; rowIndex++) {
            for (let colIndex = rowIndex; colIndex < numPoints; colIndex++) {
                let point1 = [dataPoints[rowIndex].x, dataPoints[rowIndex].y];
                let point2 = [dataPoints[colIndex].x, dataPoints[colIndex].y];
                
                kernelMatrix[rowIndex][colIndex] = kernelFunctions[this.kernelType](point1, point2, this.kernelParameters[this.kernelType]);
                kernelMatrix[colIndex][rowIndex] = kernelMatrix[rowIndex][colIndex];
            }
        }
        return kernelMatrix;
    }

    optimizeLagrangeMultipliers(kernelMatrix) {
        let convergencePasses = 0;
        let maxConvergencePasses = 10;
        let iterationCount = 0;

        while (convergencePasses < maxConvergencePasses && iterationCount < this.maxIterations) {
            let numChangedMultipliers = 0;
            
            for (let pointIndex = 0; pointIndex < this.normalizedPoints.length; pointIndex++) {
                numChangedMultipliers += this.optimizePointMultiplier(pointIndex, kernelMatrix);
            }

            iterationCount++;
            
            if (numChangedMultipliers == 0) {
                convergencePasses++;
            } else {
                convergencePasses = 0;
            }
        }

        this.supportVectors = [];
        for (let pointIndex = 0; pointIndex < this.normalizedPoints.length; pointIndex++) {
            if (Math.abs(this.lagrangeMultipliers[pointIndex]) > this.epsilon) {
                this.supportVectors.push(this.normalizedPoints[pointIndex]);
            }
        }

        if (this.supportVectors.length === 0) {
            let marginValues = [];
            for (let pointIndex = 0; pointIndex < this.normalizedPoints.length; pointIndex++) {
                marginValues.push({
                    index: pointIndex,
                    margin: Math.abs(1 - this.normalizedPoints[pointIndex].class * this.computeObjectiveValue(pointIndex, kernelMatrix))
                });
            }
            
            marginValues.sort(function(a, b) { 
                return a.margin - b.margin;
            });
            
            let numSupportVectors = Math.min(3, this.normalizedPoints.length);
            let supportVectorIndices = [];
            for (let i = 0; i < numSupportVectors; i++) {
                supportVectorIndices.push(marginValues[i].index);
            }
            
            for (let i = 0; i < supportVectorIndices.length; i++) {
                this.lagrangeMultipliers[supportVectorIndices[i]] = this.regularizationParameter / 2;
            }
            
            this.supportVectors = [];
            for (let i = 0; i < supportVectorIndices.length; i++) {
                this.supportVectors.push(this.normalizedPoints[supportVectorIndices[i]]);
            }
        }

        this.updateBias(kernelMatrix);
    }

    optimizePointMultiplier(pointIndex1, kernelMatrix) {
        let label1 = this.normalizedPoints[pointIndex1].class;
        let alpha1 = this.lagrangeMultipliers[pointIndex1];
        let errorValue1 = this.computeObjectiveValue(pointIndex1, kernelMatrix) - label1;
        
        if (!((label1 * errorValue1 < -this.tolerance && alpha1 < this.regularizationParameter) ||
              (label1 * errorValue1 > this.tolerance && alpha1 > 0))) {
            return 0;
        }

        let pointIndex2 = -1;
        let maxError = 0;

        for (let candidateIndex = 0; candidateIndex < this.normalizedPoints.length; candidateIndex++) {
            if (candidateIndex === pointIndex1) continue;
            
            let errorValue2 = this.computeObjectiveValue(candidateIndex, kernelMatrix) - this.normalizedPoints[candidateIndex].class;
            let errorDifference = Math.abs(errorValue1 - errorValue2);
            
            if (errorDifference > maxError) {
                maxError = errorDifference;
                pointIndex2 = candidateIndex;
            }
        }

        if (pointIndex2 >= 0) {
            return this.optimizeMultiplierPair(pointIndex1, pointIndex2, kernelMatrix);
        }

        return 0;
    }

    optimizeMultiplierPair(pointIndex1, pointIndex2, kernelMatrix) {
        if (pointIndex1 === pointIndex2) return 0;

        let label1 = this.normalizedPoints[pointIndex1].class;
        let label2 = this.normalizedPoints[pointIndex2].class;
        let alpha1 = this.lagrangeMultipliers[pointIndex1];
        let alpha2 = this.lagrangeMultipliers[pointIndex2];
        let errorValue1 = this.computeObjectiveValue(pointIndex1, kernelMatrix) - label1;
        let errorValue2 = this.computeObjectiveValue(pointIndex2, kernelMatrix) - label2;
        let labelProduct = label1 * label2;

        let boxConstraintLow, boxConstraintHigh;
        if (label1 !== label2) {
            boxConstraintLow = Math.max(0, alpha2 - alpha1);
            boxConstraintHigh = Math.min(this.regularizationParameter, this.regularizationParameter + alpha2 - alpha1);
        } else {
            boxConstraintLow = Math.max(0, alpha1 + alpha2 - this.regularizationParameter);
            boxConstraintHigh = Math.min(this.regularizationParameter, alpha1 + alpha2);
        }

        if (boxConstraintLow >= boxConstraintHigh) return 0;

        let kernelValue = 2 * kernelMatrix[pointIndex1][pointIndex2] - kernelMatrix[pointIndex1][pointIndex1] - kernelMatrix[pointIndex2][pointIndex2];
        if (kernelValue >= 0) return 0;

        let newAlpha2 = alpha2 - label2 * (errorValue1 - errorValue2) / kernelValue;
        newAlpha2 = Math.min(boxConstraintHigh, Math.max(boxConstraintLow, newAlpha2));

        if (Math.abs(newAlpha2 - alpha2) < this.epsilon) return 0;

        let newAlpha1 = alpha1 + labelProduct * (alpha2 - newAlpha2);
        if (newAlpha1 < 0 || newAlpha1 > this.regularizationParameter) return 0;

        let newBias1 = this.bias - errorValue1 - label1 * (newAlpha1 - alpha1) * kernelMatrix[pointIndex1][pointIndex1] - 
                       label2 * (newAlpha2 - alpha2) * kernelMatrix[pointIndex1][pointIndex2];
        let newBias2 = this.bias - errorValue2 - label1 * (newAlpha1 - alpha1) * kernelMatrix[pointIndex1][pointIndex2] - 
                       label2 * (newAlpha2 - alpha2) * kernelMatrix[pointIndex2][pointIndex2];

        if (0 < newAlpha1 && newAlpha1 < this.regularizationParameter) {
            this.bias = newBias1;
        } else if (0 < newAlpha2 && newAlpha2 < this.regularizationParameter) {
            this.bias = newBias2;
        } else {
            this.bias = (newBias1 + newBias2) / 2;
        }

        this.lagrangeMultipliers[pointIndex1] = newAlpha1;
        this.lagrangeMultipliers[pointIndex2] = newAlpha2;

        return 1;
    }

    computeObjectiveValue(pointIndex, kernelMatrix) {
        let sum = 0;
        for (let j = 0; j < this.normalizedPoints.length; j++) {
            sum += this.lagrangeMultipliers[j] * this.normalizedPoints[j].class * kernelMatrix[pointIndex][j];
        }
        return sum + this.bias;
    }

    updateBias(kernelMatrix) {
        let freeTermSum = 0;
        let numFreeTerms = 0;

        for (let pointIndex = 0; pointIndex < this.normalizedPoints.length; pointIndex++) {
            if (this.lagrangeMultipliers[pointIndex] > 0 && this.lagrangeMultipliers[pointIndex] < this.regularizationParameter) {
                let currentLabel = this.normalizedPoints[pointIndex].class;
                let sum = 0;
                for (let j = 0; j < this.normalizedPoints.length; j++) {
                    sum += this.lagrangeMultipliers[j] * this.normalizedPoints[j].class * kernelMatrix[pointIndex][j];
                }
                freeTermSum += currentLabel - sum;
                numFreeTerms++;
            }
        }

        if (numFreeTerms > 0) {
            this.bias = freeTermSum / numFreeTerms;
        }
    }

    predict(testPoint) {
        let normalizedPoint = [
            (testPoint.x - this.normalizationParameters.meanX) / this.normalizationParameters.stdX,
            (testPoint.y - this.normalizationParameters.meanY) / this.normalizationParameters.stdY
        ];
        
        let decisionValue = 0;
        for (let pointIndex = 0; pointIndex < this.normalizedPoints.length; pointIndex++) {
            if (Math.abs(this.lagrangeMultipliers[pointIndex]) > this.epsilon) {
                let supportVector = [this.normalizedPoints[pointIndex].x, this.normalizedPoints[pointIndex].y];
                decisionValue += this.lagrangeMultipliers[pointIndex] * this.normalizedPoints[pointIndex].class * 
                       kernelFunctions[this.kernelType](normalizedPoint, supportVector, this.kernelParameters[this.kernelType]);
            }
        }
        return decisionValue + this.bias;
    }

    generateDecisionBoundary(width, height, gridResolution) {
        if (!gridResolution) gridResolution = 50;
        
        let boundaryPoints = [];
        let stepSizeX = width / gridResolution;
        let stepSizeY = height / gridResolution;
        
        for (let xCoord = 0; xCoord < width; xCoord += stepSizeX) {
            for (let yCoord = 0; yCoord < height; yCoord += stepSizeY) {
                let predictedValue = this.predict({x: xCoord, y: yCoord});
                boundaryPoints.push({x: xCoord, y: yCoord, value: predictedValue});
            }
        }
        
        return boundaryPoints;
    }
}