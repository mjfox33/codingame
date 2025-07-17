// Step 1: Read input
const N = 5;
const points = [[485, 475], [1150, 750], [1008, 480], [1562, 134], [1155, 523]];

// Step 2: Compute distance matrix
const dist = Array.from({ length: N }, () => Array(N).fill(0));
for (let i = 0; i < N; i++) {
    for (let j = 0; j < N; j++) {
        const dx = points[i][0] - points[j][0];
        const dy = points[i][1] - points[j][1];
        dist[i][j] = Math.sqrt(dx * dx + dy * dy);
    }
}

// Step 3: Nearest Neighbor initial tour
const tour = [0];
const visited = Array(N).fill(false);
visited[0] = true;
let current = 0;
while (tour.length < N) {
    let minDist = Infinity;
    let next = -1;
    for (let j = 0; j < N; j++) {
        if (!visited[j] && dist[current][j] < minDist) {
            minDist = dist[current][j];
            next = j;
        }
    }
    tour.push(next);
    visited[next] = true;
    current = next;
}

// Step 4: 2-Opt optimization
let improved = true;
while (improved) {
    improved = false;
    for (let i = 0; i < N - 2; i++) {
        for (let k = i + 2; k < N; k++) {
            const a = tour[i];
            const b = tour[(i + 1) % N];
            const c = tour[k];
            const d = tour[(k + 1) % N];
            const delta = -dist[a][b] - dist[c][d] + dist[a][c] + dist[b][d];
            if (delta < -1e-10) { // Avoid floating-point issues
                const segment = tour.slice(i + 1, k + 1).reverse();
                tour.splice(i + 1, k - i, ...segment);
                improved = true;
                break;
            }
        }
        if (improved) break; // Restart if improved
    }
}

// Step 5: Calculate total distance
let totalDistance = 0;
for (let i = 0; i < N - 1; i++) {
    totalDistance += dist[tour[i]][tour[i + 1]];
}
totalDistance += dist[tour[N - 1]][tour[0]];

// Step 6: Output result
console.log(tour.join(' ') + ' ' + tour[0]); // Indices in order of travel
console.log(totalDistance.toFixed(6));       // Total distance
