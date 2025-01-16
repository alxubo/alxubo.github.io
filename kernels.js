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

        // Calculate bounds
        let L, H;
        if (y1 !== y2) {
            L = Math.max(0, alpha2 - alpha1);
            H = Math.min(this.C, this.C + alpha2 - alpha1);
        } else {
            L = Math.max(0, alpha1 + alpha2 - this.C);
            H = Math.min(this.C, alpha1 + alpha2);
        }
        
        if (L >= H) return false;

        // Compute kernel values
        const k11 = this.computeKernel(points[i1], points[i1]);
        const k12 = this.computeKernel(points[i1], points[i2]);
        const k22 = this.computeKernel(points[i2], points[i2]);
        const eta = 2 * k12 - k11 - k22;

        // Calculate new alpha2
        let a2;
        if (eta < 0) {
            a2 = alpha2 - y2 * (E1 - E2) / eta;
            if (a2 < L) a2 = L;
            else if (a2 > H) a2 = H;
        } else {
            return false;
        }

        if (Math.abs(a2 - alpha2) < this.eps * (a2 + alpha2 + this.eps)) {
            return false;
        }

        // Calculate new alpha1
        const a1 = alpha1 + s * (alpha2 - a2);

        // Update bias
        const b1 = b - E1 - y1 * (a1 - alpha1) * k11 - y2 * (a2 - alpha2) * k12;
        const b2 = b - E2 - y1 * (a1 - alpha1) * k12 - y2 * (a2 - alpha2) * k22;

        let newB;
        if (0 < a1 && a1 < this.C) newB = b1;
        else if (0 < a2 && a2 < this.C) newB = b2;
        else newB = (b1 + b2) / 2;

        // Update alphas
        alphas[i1] = a1;
        alphas[i2] = a2;

        // Update error cache
        for (let i = 0; i < points.length; i++) {
            if (0 < alphas[i] && alphas[i] < this.C) {
                errors[i] = this.computeF(points[i], points, alphas, newB) - points[i].class;
            }
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
        
        // Initialize variables
        const alphas = new Array(n).fill(0.1);  // Initialize with small non-zero values
        const errors = new Array(n).fill(0);
        this.b = 0;
        
        // Initialize error cache
        for (let i = 0; i < n; i++) {
            errors[i] = this.computeF(X[i], X, alphas, this.b) - X[i].class;
        }

        let numChanged = 0;
        let examineAll = true;
        
        // Main training loop
        for (let iter = 0; iter < this.maxIterations; iter++) {
            numChanged = 0;

            if (examineAll) {
                // Loop over all points
                for (let i = 0; i < n; i++) {
                    numChanged += this.examineExample(i, X, alphas, errors);
                }
            } else {
                // Loop over points where alpha is not 0 or C
                for (let i = 0; i < n; i++) {
                    if (alphas[i] > 0 && alphas[i] < this.C) {
                        numChanged += this.examineExample(i, X, alphas, errors);
                    }
                }
            }

            if (examineAll) {
                examineAll = false;
            } else if (numChanged === 0) {
                examineAll = true;
            }

            if (numChanged === 0 && !examineAll) break;
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