// Dartboard rendering and interaction
class Dartboard {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.centerX = this.canvas.width / 2;
        this.centerY = this.canvas.height / 2;
        this.enabled = false;

        // Dartboard dimensions (from center outward)
        this.radiusBullseye = 15;
        this.radiusBull = 40;
        this.radiusInnerSingle = 100;
        this.radiusTriple = 115;
        this.radiusOuterSingle = 170;
        this.radiusDouble = 185;

        // Standard dartboard number sequence (clockwise from top)
        this.numbers = [20, 1, 18, 4, 13, 6, 10, 15, 2, 17, 3, 19, 7, 16, 8, 11, 14, 9, 12, 5];

        // Colors
        this.colors = {
            black: '#000000',
            white: '#F0E6D2',
            red: '#DC143C',
            green: '#228B22',
            bullseye: '#DC143C',
            bull: '#228B22'
        };

        this.setupClickHandler();
        this.draw();
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw background
        this.ctx.fillStyle = '#1a1a1a';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw outer circle (border)
        this.drawCircle(this.centerX, this.centerY, this.radiusDouble + 10, '#2a2a2a');

        // Draw the 20 segments
        for (let i = 0; i < 20; i++) {
            const startAngle = (i * 18 - 9) * Math.PI / 180;
            const endAngle = ((i + 1) * 18 - 9) * Math.PI / 180;
            const isRed = i % 2 === 0;

            // Outer single (between triple and double)
            this.drawSegment(startAngle, endAngle, this.radiusTriple, this.radiusDouble,
                isRed ? this.colors.red : this.colors.black);

            // Triple ring
            this.drawSegment(startAngle, endAngle, this.radiusInnerSingle, this.radiusTriple,
                isRed ? this.colors.red : this.colors.green);

            // Inner single (between bull and triple)
            this.drawSegment(startAngle, endAngle, this.radiusBull, this.radiusInnerSingle,
                isRed ? this.colors.white : this.colors.black);

            // Draw numbers
            this.drawNumber(i, this.numbers[i]);
        }

        // Draw bull (outer)
        this.drawCircle(this.centerX, this.centerY, this.radiusBull, this.colors.bull);

        // Draw bullseye (inner)
        this.drawCircle(this.centerX, this.centerY, this.radiusBullseye, this.colors.bullseye);

        // Draw separating lines
        this.drawSeparators();
    }

    drawCircle(x, y, radius, color) {
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, 0, 2 * Math.PI);
        this.ctx.fillStyle = color;
        this.ctx.fill();
    }

    drawSegment(startAngle, endAngle, innerRadius, outerRadius, color) {
        this.ctx.beginPath();
        this.ctx.arc(this.centerX, this.centerY, outerRadius, startAngle, endAngle);
        this.ctx.arc(this.centerX, this.centerY, innerRadius, endAngle, startAngle, true);
        this.ctx.closePath();
        this.ctx.fillStyle = color;
        this.ctx.fill();
    }

    drawNumber(index, number) {
        const angle = (index * 18) * Math.PI / 180;
        const radius = this.radiusDouble + 25;
        const x = this.centerX + radius * Math.sin(angle);
        const y = this.centerY - radius * Math.cos(angle);

        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.font = 'bold 20px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(number, x, y);
    }

    drawSeparators() {
        this.ctx.strokeStyle = '#2a2a2a';
        this.ctx.lineWidth = 2;

        // Draw radial lines
        for (let i = 0; i < 20; i++) {
            const angle = (i * 18 - 9) * Math.PI / 180;
            this.ctx.beginPath();
            this.ctx.moveTo(
                this.centerX + this.radiusBull * Math.sin(angle),
                this.centerY - this.radiusBull * Math.cos(angle)
            );
            this.ctx.lineTo(
                this.centerX + this.radiusDouble * Math.sin(angle),
                this.centerY - this.radiusDouble * Math.cos(angle)
            );
            this.ctx.stroke();
        }

        // Draw ring circles
        [this.radiusBull, this.radiusInnerSingle, this.radiusTriple, this.radiusDouble].forEach(radius => {
            this.ctx.beginPath();
            this.ctx.arc(this.centerX, this.centerY, radius, 0, 2 * Math.PI);
            this.ctx.stroke();
        });
    }

    setupClickHandler() {
        this.canvas.addEventListener('click', (e) => {
            if (!this.enabled) return;

            const rect = this.canvas.getBoundingClientRect();
            const scaleX = this.canvas.width / rect.width;
            const scaleY = this.canvas.height / rect.height;
            const x = (e.clientX - rect.left) * scaleX;
            const y = (e.clientY - rect.top) * scaleY;

            const result = this.getSegment(x, y);
            if (result && this.onDartThrow) {
                this.onDartThrow(result);
            }
        });

        // Hover effect
        this.canvas.addEventListener('mousemove', (e) => {
            if (!this.enabled) {
                this.canvas.style.cursor = 'not-allowed';
            } else {
                this.canvas.style.cursor = 'crosshair';
            }
        });
    }

    getSegment(clickX, clickY) {
        const dx = clickX - this.centerX;
        const dy = clickY - this.centerY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Check if click is outside the dartboard
        if (distance > this.radiusDouble) {
            return null;
        }

        // Bullseye
        if (distance <= this.radiusBullseye) {
            return { score: 25, multiplier: 2 }; // Double bull
        }

        // Bull
        if (distance <= this.radiusBull) {
            return { score: 25, multiplier: 1 }; // Single bull
        }

        // Calculate angle (0 degrees = top, clockwise)
        let angle = Math.atan2(dx, -dy) * 180 / Math.PI;
        if (angle < 0) angle += 360;

        // Adjust angle to match segment boundaries (-9 degrees offset)
        angle = (angle + 9) % 360;

        // Get segment number
        const segmentIndex = Math.floor(angle / 18);
        const score = this.numbers[segmentIndex];

        // Determine multiplier based on distance
        let multiplier = 1;

        if (distance >= this.radiusDouble) {
            multiplier = 2; // Double ring
        } else if (distance >= this.radiusOuterSingle && distance < this.radiusDouble) {
            multiplier = 1; // Outer single
        } else if (distance >= this.radiusTriple && distance < this.radiusOuterSingle) {
            multiplier = 3; // Triple ring
        } else if (distance >= this.radiusInnerSingle && distance < this.radiusTriple) {
            multiplier = 1; // Inner single (between triple and bull)
        } else {
            multiplier = 1; // Near bull area
        }

        return { score, multiplier };
    }

    setEnabled(enabled) {
        this.enabled = enabled;
        this.canvas.classList.toggle('disabled', !enabled);
    }

    showFeedback(x, y, text) {
        const feedback = document.getElementById('click-feedback');
        feedback.textContent = text;
        feedback.style.left = x + 'px';
        feedback.style.top = y + 'px';
        feedback.classList.remove('hidden');

        setTimeout(() => {
            feedback.classList.add('hidden');
        }, 1000);
    }
}
