const kernelFunctions = {
    linear: function(x1, x2) {
        return x1[0] * x2[0] + x1[1] * x2[1];
    },
    polynomial: function(x1, x2, params = {}) {
        const degree = params.polynomial || 2;
        return Math.pow((x1[0] * x2[0] + x1[1] * x2[1]) + 1, degree);
    },
    rbf: function(x1, x2, params = {}) {
        const gamma = params.rbf || 1;
        const dist = Math.pow(x1[0] - x2[0], 2) + Math.pow(x1[1] - x2[1], 2);
        return Math.exp(-gamma * dist);
    }
};

class KernelSVM {
    constructor(options = {}) {
        this.kernel = options.kernel || 'linear';
        this.C = options.C || 1;
        this.maxIterations = options.maxIterations || 1000;
        this.kernelParams = options.kernelParams || {};
        this.tol = 1e-3;
        this.eps = 1e-3;
        
        // Normalization parameters
        this.norm = { meanX: 0, meanY: 0, stdX: 1, stdY: 1 };
        
        // Training state
        this.alphas = null;
        this.b = 0;
        this.normalizedPoints = null;
        this.trained = false;
    }

    normalize(points) {
        const n = points.length;
        let sumX = 0, sumY = 0;
        
        // Calculate means
        points.forEach(p => {
            sumX += p.x;
            sumY += p.y;
        });
        
        this.norm.meanX = sumX / n;
        this.norm.meanY = sumY / n;
        
        // Calculate standard deviations
        let varX = 0, varY = 0;
        points.forEach(p => {
            varX += Math.pow(p.x - this.norm.meanX, 2);
            varY += Math.pow(p.y - this.norm.meanY, 2);
        });
        
        this.norm.stdX = Math.sqrt(varX / n) || 1;
        this.norm.stdY = Math.sqrt(varY / n) || 1;
        
        // Normalize points
        return points.map(p => ({
            x: (p.x - this.norm.meanX) / this.norm.stdX,
            y: (p.y - this.norm.meanY) / this.norm.stdY,
            class: p.class === -1 ? -1 : 1
        }));
    }

    computeKernel(x1, x2) {
        return kernelFunctions[this.kernel](
            [x1.x, x1.y],
            [x2.x, x2.y],
            this.kernelParams
        );
    }

    computeF(point, points, alphas, b) {
        let f = 0;
        for (let i = 0; i < points.length; i++) {
            if (Math.abs(alphas[i]) > this.eps) {
                f += alphas[i] * points[i].class * this.computeKernel(point, points[i]);
            }
        }
        return f + b;
    }

    takeStep(i1, i2, points, alphas, errors, b) {
        if (i1 === i2) return false;

        const alpha1 = alphas[i1];
        const alpha2 = alphas[i2];
        const y1 = points[i1].class;
        const y2 = points[i2].class;
        const E1 = errors[i1];
        const E2 = errors[i2];
        const s = y1 * y2;

        // Calculate bounds with strict C enforcement
        let L, H;
        if (y1 !== y2) {
            L = Math.max(0, alpha2 - alpha1);
            H = Math.min(this.C, this.C + alpha2 - alpha1);
        } else {
            L = Math.max(0, alpha1 + alpha2 - this.C);
            H = Math.min(this.C, alpha1 + alpha2);
        }
        
        if (L >= H - this.eps) return false;

        // Compute kernel values
        const k11 = this.computeKernel(points[i1], points[i1]);
        const k12 = this.computeKernel(points[i1], points[i2]);
        const k22 = this.computeKernel(points[i2], points[i2]);
        const eta = 2 * k12 - k11 - k22;

        // Calculate new alpha2 with improved numerics
        let a2;
        if (eta < -this.eps) {  // Строгая проверка на отрицательность
            a2 = alpha2 - y2 * (E1 - E2) / eta;
            
            // Более строгое клиппирование
            if (a2 < L) a2 = L;
            else if (a2 > H) a2 = H;
            
            // Проверка на численную стабильность
            if (a2 < 1e-8) a2 = 0;
            if (Math.abs(a2 - this.C) < 1e-8) a2 = this.C;
        } else {
            return false;
        }

        // Более строгая проверка на значимость изменения
        if (Math.abs(a2 - alpha2) < this.eps * Math.max(Math.abs(a2), Math.abs(alpha2), 1.0)) {
            return false;
        }

        // Calculate new alpha1 with bounds checking
        const a1 = alpha1 + s * (alpha2 - a2);
        
        // Ensure alpha1 stays within bounds
        if (a1 < 0 || a1 > this.C) return false;

        // Update bias with improved stability
        const b1 = b - E1 
                    - y1 * (a1 - alpha1) * k11 
                    - y2 * (a2 - alpha2) * k12;
        const b2 = b - E2 
                    - y1 * (a1 - alpha1) * k12 
                    - y2 * (a2 - alpha2) * k22;

        // More precise bias selection
        let newB;
        const t1 = y1 * a1;
        const t2 = y2 * a2;

        if (a1 > this.eps && a1 < this.C - this.eps) newB = b1;
        else if (a2 > this.eps && a2 < this.C - this.eps) newB = b2;
        else if (t1 > t2) newB = b1;
        else if (t2 > t1) newB = b2;
        else newB = (b1 + b2) / 2;

        // Update alphas
        alphas[i1] = a1;
        alphas[i2] = a2;

        // Update error cache
        for (let i = 0; i < points.length; i++) {
            errors[i] = this.computeF(points[i], points, alphas, newB) - points[i].class;
        }

        this.b = newB;
        return true;
    }

    examineExample(i2, points, alphas, errors) {
        const y2 = points[i2].class;
        const alpha2 = alphas[i2];
        const E2 = errors[i2];
        const r2 = E2 * y2;

        if ((r2 < -this.tol && alpha2 < this.C) || (r2 > this.tol && alpha2 > 0)) {
            // Try non-bound points first
            let maxDelta = 0;
            let i1 = -1;

            for (let i = 0; i < points.length; i++) {
                if (alphas[i] > 0 && alphas[i] < this.C) {
                    const delta = Math.abs(errors[i] - E2);
                    if (delta > maxDelta) {
                        maxDelta = delta;
                        i1 = i;
                    }
                }
            }

            if (i1 >= 0 && this.takeStep(i1, i2, points, alphas, errors, this.b)) {
                return 1;
            }

            // Try all points
            for (let i = 0; i < points.length; i++) {
                if (this.takeStep(i, i2, points, alphas, errors, this.b)) {
                    return 1;
                }
            }
        }
        return 0;
    }

    train(points) {
        const X = this.normalize(points);
        const n = X.length;
        
        // Initialize variables with zeros
        const alphas = new Array(n).fill(0);
        const errors = new Array(n).fill(0);
        this.b = 0;
        
        // Initialize error cache with proper class weights
        for (let i = 0; i < n; i++) {
            errors[i] = -X[i].class; // Initially all predictions are 0
        }

        let numChanged = 0;
        let examineAll = true;
        let iterCount = 0;

        // Main training loop with improved convergence checks
        for (let iter = 0; iter < this.maxIterations; iter++) {
            numChanged = 0;
            iterCount++;

            if (examineAll) {
                // Loop over all points
                for (let i = 0; i < n; i++) {
                    numChanged += this.examineExample(i, X, alphas, errors);
                }
            } else {
                // First try points with non-bound alphas
                for (let i = 0; i < n; i++) {
                    if (alphas[i] > this.eps && alphas[i] < this.C - this.eps) {
                        numChanged += this.examineExample(i, X, alphas, errors);
                    }
                }
                
                // If no progress, try all points
                if (numChanged === 0) {
                    for (let i = 0; i < n; i++) {
                        numChanged += this.examineExample(i, X, alphas, errors);
                    }
                }
            }

            // Update strategy
            if (examineAll) {
                examineAll = false;
            } else if (numChanged === 0) {
                examineAll = true;
            }

            // Convergence checks
            let violationSum = 0;
            for (let i = 0; i < n; i++) {
                if (alphas[i] < -this.eps || alphas[i] > this.C + this.eps) {
                    violationSum += Math.min(Math.abs(alphas[i]), Math.abs(alphas[i] - this.C));
                }
            }

            // Break if constraints are satisfied and no progress
            if (violationSum < this.eps && numChanged === 0) break;
        }

        // Store the training results
        this.alphas = alphas;
        this.normalizedPoints = X;
        this.trained = true;

        if (this.kernel === 'linear') {
            // Compute weights for linear kernel
            const w = [0, 0];
            for (let i = 0; i < n; i++) {
                if (Math.abs(alphas[i]) > this.eps) {
                    w[0] += alphas[i] * X[i].class * X[i].x;
                    w[1] += alphas[i] * X[i].class * X[i].y;
                }
            }

            // Denormalize weights and bias
            const denormW = [
                w[0] / this.norm.stdX,
                w[1] / this.norm.stdY
            ];
            const denormB = this.b - (
                denormW[0] * this.norm.meanX + 
                denormW[1] * this.norm.meanY
            );

            return {
                w: denormW,
                b: denormB,
                lambdas: alphas
            };
        }

        return { lambdas: alphas };
    }

    predict(point) {
        if (!this.trained) {
            throw new Error('Model must be trained before making predictions');
        }

        const normalizedPoint = {
            x: (point.x - this.norm.meanX) / this.norm.stdX,
            y: (point.y - this.norm.meanY) / this.norm.stdY
        };
        
        return this.computeF(normalizedPoint, this.normalizedPoints, this.alphas, this.b);
    }

    generateDecisionBoundary(width, height, gridResolution = 50) {
        if (!this.trained) {
            throw new Error('Model must be trained before generating decision boundary');
        }

        const stepX = width / gridResolution;
        const stepY = height / gridResolution;
        const boundaryPoints = [];
        
        for (let x = 0; x < width; x += stepX) {
            for (let y = 0; y < height; y += stepY) {
                const value = this.predict({x, y});
                boundaryPoints.push({x, y, value});
            }
        }
        
        return boundaryPoints;
    }
}