// Global variables
console.log('CPU Scheduler script loaded successfully!');
let processes = [];
let processCounter = 1;
let currentAlgorithm = 'fcfs';
let priorityMode = 'low'; // 'low' = lower number is higher priority, 'high' = higher number is higher priority

// Color palette for processes
const processColors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8',
    '#F7B731', '#5F27CD', '#00D2D3', '#FF9FF3', '#54A0FF'
];

// Algorithm information
const algoInfo = {
    fcfs: {
        name: 'First Come First Serve (FCFS)',
        description: 'First Come First Serve is the simplest scheduling algorithm that executes processes in the order they arrive. It is non-preemptive and may lead to the convoy effect.'
    },
    sjf: {
        name: 'Shortest Job First (SJF)',
        description: 'Shortest Job First selects the process with the smallest execution time. This non-preemptive algorithm minimizes average waiting time but may cause starvation for longer processes.'
    },
    srtf: {
        name: 'Shortest Remaining Time First (SRTF)',
        description: 'SRTF is the preemptive version of SJF. It switches to a newly arrived process if its burst time is less than the remaining time of the current process, providing optimal average waiting time.'
    },
    priority: {
        name: 'Priority Scheduling',
        description: 'Priority Scheduling executes processes based on priority values. You can choose whether lower or higher numbers represent higher priority. This non-preemptive algorithm may suffer from indefinite blocking or starvation.'
    },
    rr: {
        name: 'Round Robin (RR)',
        description: 'Round Robin assigns a fixed time quantum to each process in a circular manner. This preemptive algorithm ensures fairness and good response time for interactive systems.'
    },
    priority_preemptive: {
        name: 'Preemptive Priority Scheduling',
        description: 'Preemptive Priority Scheduling can interrupt a running process if a higher-priority process arrives. You can choose whether lower or higher numbers represent higher priority. This algorithm provides better response time for high-priority processes but may cause more context switches.'
    },
    priority_rr: {
        name: 'Priority Scheduling with Round Robin',
        description: 'This hybrid algorithm combines Priority Scheduling with Round Robin. Processes are selected based on priority, but processes with equal priority are scheduled using Round Robin with a time quantum. This ensures fairness among same-priority processes while maintaining priority-based scheduling.'
    }
};

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    // Show landing page by default
    showLandingPage();
});

// Show landing page
function showLandingPage() {
    document.getElementById('landingPage').style.display = 'flex';
    document.getElementById('simulatorPage').style.display = 'none';
    // Hide results when going back to landing page
    document.getElementById('resultsSection').style.display = 'none';
}

// Select algorithm from landing page
function selectAlgorithm(algorithm) {
    currentAlgorithm = algorithm;
    document.getElementById('landingPage').style.display = 'none';
    document.getElementById('simulatorPage').style.display = 'block';
    
    // Hide previous results
    document.getElementById('resultsSection').style.display = 'none';
    
    // Update algorithm info
    updateAlgorithmInfo(algorithm);
    
    // Update dropdown button text
    updateCurrentAlgoName(algorithm);
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Go back to landing page
function goBackToLanding() {
    showLandingPage();
}

// Update algorithm information
function updateAlgorithmInfo(algorithm) {
    const info = algoInfo[algorithm];
    document.getElementById('selectedAlgoName').textContent = info.name;
    document.getElementById('algoInfoTitle').textContent = info.name;
    document.getElementById('algoDescription').textContent = info.description;
    
    const priorityInput = document.getElementById('priorityInput');
    const priorityInputHeader = document.getElementById('priorityInputHeader');
    const priorityHeader = document.getElementById('priorityHeader');
    const quantumInput = document.getElementById('quantumInput');
    const priorityModeInput = document.getElementById('priorityModeInput');

    // Reset all
    if (priorityInput) priorityInput.style.display = 'none';
    if (priorityInputHeader) priorityInputHeader.style.display = 'none';
    if (priorityHeader) priorityHeader.style.display = 'none';
    if (quantumInput) quantumInput.style.display = 'none';
    if (priorityModeInput) priorityModeInput.style.display = 'none';

    // Show/hide priority input
    if (algorithm === 'priority' || algorithm === 'priority_preemptive' || algorithm === 'priority_rr') {
        if (priorityInput) priorityInput.style.display = 'flex';
        if (priorityInputHeader) priorityInputHeader.style.display = 'table-cell';
        if (priorityHeader) priorityHeader.style.display = 'table-cell';
        if (priorityModeInput) priorityModeInput.style.display = 'flex';
    }

    // Show/hide time quantum input
    if (algorithm === 'rr' || algorithm === 'priority_rr') {
        if (quantumInput) quantumInput.style.display = 'flex';
    }

    // Initialize process input table
    updateProcessInputTable();
    updateProcessInputTable();
    updateProcessTable();
}

// Increment process count in stepper
function incrementProcessCount() {
    const input = document.getElementById('processCount');
    const currentValue = parseInt(input.value) || 3;
    if (currentValue < 20) {
        input.value = currentValue + 1;
        updateProcessInputTable();
    }
}

// Decrement process count in stepper
function decrementProcessCount() {
    const input = document.getElementById('processCount');
    const currentValue = parseInt(input.value) || 3;
    if (currentValue > 1) {
        input.value = currentValue - 1;
        updateProcessInputTable();
    }
}

// Toggle algorithm dropdown
function toggleAlgoDropdown() {
    const dropdown = document.getElementById('algoDropdownMenu');
    dropdown.classList.toggle('show');
}

// Switch algorithm
function switchAlgorithm(algorithm) {
    currentAlgorithm = algorithm;
    updateAlgorithmInfo(algorithm);
    updateCurrentAlgoName(algorithm);
    toggleAlgoDropdown();
    
    // Hide previous results
    document.getElementById('resultsSection').style.display = 'none';
    
    // Clear processes and reset
    processes = [];
    processCounter = 1;
    updateProcessTable();
    updateProcessInputTable();
    
    showNotification(`Switched to ${algoInfo[algorithm].name}`, 'success');
}

// Update current algorithm name in dropdown button
function updateCurrentAlgoName(algorithm) {
    const algoNames = {
        'fcfs': 'FCFS',
        'sjf': 'SJF',
        'srtf': 'SRTF',
        'priority': 'Priority',
        'rr': 'Round Robin',
        'priority_preemptive': 'Preemptive Priority',
        'priority_rr': 'Priority with RR'
    };
    document.getElementById('currentAlgoName').textContent = algoNames[algorithm];
}

// Close dropdown when clicking outside
document.addEventListener('click', function(event) {
    const dropdown = document.querySelector('.algorithm-dropdown');
    if (dropdown && !dropdown.contains(event.target)) {
        document.getElementById('algoDropdownMenu')?.classList.remove('show');
    }
});

// Update the process input table based on count
function updateProcessInputTable() {
    const processCount = parseInt(document.getElementById('processCount').value) || 3;
    const tbody = document.getElementById('processInputTableBody');
    tbody.innerHTML = '';

    for (let i = 1; i <= processCount; i++) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><strong>P${i}</strong></td>
            <td><input type="number" class="table-input" id="arrival_${i}" value="0" min="0" placeholder="0"></td>
            <td><input type="number" class="table-input" id="burst_${i}" value="" min="1" placeholder="Enter" required></td>
            ${(currentAlgorithm === 'priority' || currentAlgorithm === 'priority_preemptive' || currentAlgorithm === 'priority_rr') ? `<td><input type="number" class="table-input" id="priority_${i}" value="1" min="1" placeholder="1"></td>` : ''}
        `;
        tbody.appendChild(row);
    }
}

// Add all processes from the table
function addAllProcesses() {
    const processCount = parseInt(document.getElementById('processCount').value) || 3;
    const newProcesses = [];
    let hasError = false;

    // Validate and collect all processes
    for (let i = 1; i <= processCount; i++) {
        const burstInput = document.getElementById(`burst_${i}`);
        const burstTime = parseInt(burstInput.value);
        
        if (!burstTime || burstTime <= 0) {
            showNotification(`Please enter a valid burst time for P${i}`, 'error');
            burstInput.focus();
            burstInput.style.borderColor = '#ff4757';
            hasError = true;
            break;
        } else {
            burstInput.style.borderColor = '';
        }

        const arrivalInput = document.getElementById(`arrival_${i}`);
        const arrivalTime = parseInt(arrivalInput.value);
        
        if (isNaN(arrivalTime) || arrivalTime < 0) {
            showNotification(`Please enter a valid arrival time (>= 0) for P${i}`, 'error');
            arrivalInput.focus();
            arrivalInput.style.borderColor = '#ff4757';
            hasError = true;
            break;
        } else {
            arrivalInput.style.borderColor = '';
        }
        
        let priority = 1;
        if (currentAlgorithm === 'priority' || currentAlgorithm === 'priority_preemptive' || currentAlgorithm === 'priority_rr') {
            const priorityInput = document.getElementById(`priority_${i}`);
            priority = parseInt(priorityInput.value);
            
            if (!priority || priority <= 0) {
                showNotification(`Please enter a valid priority (> 0) for P${i}`, 'error');
                priorityInput.focus();
                priorityInput.style.borderColor = '#ff4757';
                hasError = true;
                break;
            } else {
                priorityInput.style.borderColor = '';
            }
        }

        const process = {
            id: processCounter + i - 1,
            name: `P${processCounter + i - 1}`,
            arrivalTime: arrivalTime,
            burstTime: burstTime,
            priority: priority,
            color: processColors[(processCounter + i - 2) % processColors.length]
        };

        newProcesses.push(process);
    }

    if (hasError) {
        return;
    }

    // Add all processes
    processes.push(...newProcesses);
    processCounter += processCount;

    // Reset the table
    document.getElementById('processCount').value = 3;
    updateProcessInputTable();
    updateProcessTable();
    
    showNotification(`${processCount} process(es) added successfully!`, 'success');
    
    // Scroll to process queue
    document.querySelector('.process-table-section').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Add a new process (kept for backward compatibility)
function addProcess() {
    const burstTime = parseInt(document.getElementById('burstTime').value);
    
    // Validation
    if (!burstTime || burstTime <= 0) {
        showNotification('Please enter a valid burst time (greater than 0)', 'error');
        document.getElementById('burstTime').focus();
        return;
    }

    const name = document.getElementById('processName').value.trim() || `P${processCounter}`;
    const arrivalTime = parseInt(document.getElementById('arrivalTime').value) || 0;
    const priority = parseInt(document.getElementById('priority').value) || 1;
    const queueType = parseInt(document.getElementById('queueTypeSelect').value) || 1;

    // Additional validation
    if (arrivalTime < 0) {
        showNotification('Arrival time cannot be negative', 'error');
        document.getElementById('arrivalTime').focus();
        return;
    }

    const process = {
        id: processCounter,
        name: name,
        arrivalTime: arrivalTime,
        burstTime: burstTime,
        queueType: queueType,
        priority: priority,
        color: processColors[(processCounter - 1) % processColors.length]
    };

    processes.push(process);
    processCounter++;

    // Reset form
    document.getElementById('processName').value = '';
    document.getElementById('arrivalTime').value = '0';
    document.getElementById('burstTime').value = '';
    document.getElementById('priority').value = '1';
    
    // Focus on process name for quick entry
    document.getElementById('processName').focus();

    updateProcessTable();
    showNotification(`Process "${name}" added successfully!`, 'success');
}

// Add a new process
function addProcess_old() {
    const burstTime = parseInt(document.getElementById('burstTime').value);
    
    // Validation
    if (!burstTime || burstTime <= 0) {
        showNotification('Please enter a valid burst time (greater than 0)', 'error');
        document.getElementById('burstTime').focus();
        return;
    }

    const name = document.getElementById('processName').value.trim() || `P${processCounter}`;
    const arrivalTime = parseInt(document.getElementById('arrivalTime').value) || 0;
    const priority = parseInt(document.getElementById('priority').value) || 1;
    const queueType = parseInt(document.getElementById('queueTypeSelect').value) || 1;

    // Additional validation
    if (arrivalTime < 0) {
        showNotification('Arrival time cannot be negative', 'error');
        document.getElementById('arrivalTime').focus();
        return;
    }

    const process = {
        id: processCounter,
        name: name,
        arrivalTime: arrivalTime,
        burstTime: burstTime,
        queueType: queueType,
        priority: priority,
        color: processColors[(processCounter - 1) % processColors.length]
    };

    processes.push(process);
    processCounter++;

    // Reset form
    document.getElementById('processName').value = '';
    document.getElementById('arrivalTime').value = '0';
    document.getElementById('burstTime').value = '';
    document.getElementById('priority').value = '1';
    
    // Focus on process name for quick entry
    document.getElementById('processName').focus();

    updateProcessTable();
    showNotification(`Process "${name}" added successfully!`, 'success');
}

// Show notification
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(notification);
    
    // Trigger animation
    setTimeout(() => notification.classList.add('show'), 10);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Update the process table display
function updateProcessTable() {
    const tbody = document.getElementById('processTableBody');
    tbody.innerHTML = '';

    if (processes.length === 0) {
        const row = document.createElement('tr');
        row.className = 'empty-state';
        row.innerHTML = `
            <td colspan="5">
                <i class="fas fa-inbox"></i>
                <p>No processes added yet</p>
            </td>
        `;
        tbody.appendChild(row);
        document.getElementById('processCount').textContent = '(0)';
        return;
    }

    document.getElementById('processCount').textContent = `(${processes.length})`;

    processes.forEach((process, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><span style="display: inline-block; width: 14px; height: 14px; background: ${process.color}; border-radius: 50%; margin-right: 10px;"></span><strong>${process.name}</strong></td>
            <td>${process.arrivalTime}</td>
            <td>${process.burstTime}</td>
            ${(currentAlgorithm === 'priority' || currentAlgorithm === 'priority_preemptive' || currentAlgorithm === 'priority_rr') ? `<td>${process.priority}</td>` : ''}
            <td><button class="btn btn-danger" onclick="removeProcess(${index})" style="padding: 8px 16px; font-size: 13px;"><i class="fas fa-trash"></i></button></td>
        `;
        tbody.appendChild(row);
    });
}

// Remove a process
function removeProcess(index) {
    const processName = processes[index].name;
    if (confirm(`Are you sure you want to remove process "${processName}"?`)) {
        processes.splice(index, 1);
        updateProcessTable();
        showNotification(`Process "${processName}" removed`, 'success');
    }
}

// Clear all processes
function clearAllProcesses() {
    if (processes.length === 0) {
        showNotification('No processes to clear', 'error');
        return;
    }
    
    if (confirm(`Are you sure you want to clear all ${processes.length} process(es)?`)) {
        processes = [];
        processCounter = 1;
        updateProcessTable();
        document.getElementById('resultsSection').style.display = 'none';
        showNotification('All processes cleared', 'success');
    }
}

// Clear all processes (old function name for compatibility)
function clearProcesses() {
    clearAllProcesses();
}

// Load sample data
function loadSampleData() {
    if (processes.length > 0) {
        if (!confirm('This will replace existing processes. Continue?')) {
            return;
        }
    }
    
    // Test data from Question 13 - CPU Scheduling Problem
    processes = [
        { id: 1, name: 'P1', arrivalTime: 0, burstTime: 11, priority: 2, color: processColors[0] },
        { id: 2, name: 'P2', arrivalTime: 0, burstTime: 3, priority: 1, color: processColors[1] },
        { id: 3, name: 'P3', arrivalTime: 5, burstTime: 9, priority: 5, color: processColors[2] },
        { id: 4, name: 'P4', arrivalTime: 2, burstTime: 4, priority: 4, color: processColors[3] },
        { id: 5, name: 'P5', arrivalTime: 1, burstTime: 9, priority: 3, color: processColors[4] }
    ];
    processCounter = 6;
    updateProcessTable();
    showNotification('Test data loaded successfully! (Question 13)', 'success');
}

// Run the simulation
function runSimulation(event) {
    // If processes array is empty, automatically add processes from input table
    if (processes.length === 0) {
        const processCount = parseInt(document.getElementById('processCount').value) || 3;
        
        // Check if user has filled in at least one burst time
        let hasAnyInput = false;
        for (let i = 1; i <= processCount; i++) {
            const burstInput = document.getElementById(`burst_${i}`);
            if (burstInput && burstInput.value && parseInt(burstInput.value) > 0) {
                hasAnyInput = true;
                break;
            }
        }
        
        if (hasAnyInput) {
            // Automatically add processes from table
            addAllProcesses();
            
            // If there was an error in addAllProcesses (validation failed), it won't add processes
            if (processes.length === 0) {
                return; // Exit, error message already shown by addAllProcesses
            }
        } else {
            showNotification('Please enter burst times for at least one process', 'error');
            const firstBurstInput = document.getElementById('burst_1');
            if (firstBurstInput) firstBurstInput.focus();
            return;
        }
    }

    // Show loading state
    const btn = event ? event.target : document.querySelector('.btn-primary.btn-large');
    if (!btn) {
        console.error('Button element not found');
        runSimulationCore();
        return;
    }
    
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Running...';
    btn.disabled = true;

    // Simulate processing time for better UX
    setTimeout(() => {
        runSimulationCore();
        btn.innerHTML = originalText;
        btn.disabled = false;
        showNotification('Simulation completed successfully!', 'success');
    }, 500);
}

// Core simulation logic
function runSimulationCore() {
    let results;

    switch (currentAlgorithm) {
        case 'fcfs':
            results = scheduleFCFS();
            break;
        case 'sjf':
            results = scheduleSJF();
            break;
        case 'srtf':
            results = scheduleSRTF();
            break;
        case 'priority':
            results = schedulePriority();
            break;
        case 'rr':
            const quantum = parseInt(document.getElementById('timeQuantum').value) || 3;
            results = scheduleRoundRobin(quantum);
            break;
        case 'priority_preemptive':
            results = schedulePreemptivePriority();
            break;
        case 'priority_rr':
            const quantumPRR = parseInt(document.getElementById('timeQuantum').value) || 3;
            results = schedulePriorityRR(quantumPRR);
            break;
        default:
            showNotification('Invalid algorithm selected', 'error');
            return;
    }

    displayResults(results);
}

// First Come First Serve (FCFS)
function scheduleFCFS() {
    const sortedProcesses = [...processes].sort((a, b) => a.arrivalTime - b.arrivalTime);
    let currentTime = 0;
    const timeline = [];
    const processResults = [];

    sortedProcesses.forEach(process => {
        const startTime = Math.max(currentTime, process.arrivalTime);
        const completionTime = startTime + process.burstTime;
        const turnaroundTime = completionTime - process.arrivalTime;
        const waitingTime = turnaroundTime - process.burstTime;
        const responseTime = startTime - process.arrivalTime;

        // Add idle time if necessary
        if (startTime > currentTime) {
            timeline.push({
                process: 'Idle',
                start: currentTime,
                end: startTime,
                color: '#e0e0e0'
            });
        }

        timeline.push({
            process: process.name,
            start: startTime,
            end: completionTime,
            color: process.color
        });

        processResults.push({
            ...process,
            completionTime,
            turnaroundTime,
            waitingTime,
            responseTime
        });

        currentTime = completionTime;
    });

    return { timeline, processResults };
}

// Shortest Job First (SJF) - Non-preemptive
function scheduleSJF() {
    const remainingProcesses = [...processes];
    let currentTime = 0;
    const timeline = [];
    const processResults = [];

    while (remainingProcesses.length > 0) {
        const availableProcesses = remainingProcesses.filter(p => p.arrivalTime <= currentTime);

        if (availableProcesses.length === 0) {
            const nextProcess = remainingProcesses.reduce((min, p) => 
                p.arrivalTime < min.arrivalTime ? p : min
            );
            timeline.push({
                process: 'Idle',
                start: currentTime,
                end: nextProcess.arrivalTime,
                color: '#e0e0e0'
            });
            currentTime = nextProcess.arrivalTime;
            continue;
        }

        const shortestJob = availableProcesses.reduce((min, p) => {
            if (p.burstTime < min.burstTime) return p;
            if (p.burstTime === min.burstTime && p.arrivalTime < min.arrivalTime) return p;
            return min;
        });

        const startTime = currentTime;
        const completionTime = startTime + shortestJob.burstTime;
        const turnaroundTime = completionTime - shortestJob.arrivalTime;
        const waitingTime = turnaroundTime - shortestJob.burstTime;
        const responseTime = startTime - shortestJob.arrivalTime;

        timeline.push({
            process: shortestJob.name,
            start: startTime,
            end: completionTime,
            color: shortestJob.color
        });

        processResults.push({
            ...shortestJob,
            completionTime,
            turnaroundTime,
            waitingTime,
            responseTime
        });

        currentTime = completionTime;
        remainingProcesses.splice(remainingProcesses.indexOf(shortestJob), 1);
    }

    return { timeline, processResults };
}

// Shortest Remaining Time First (SRTF) - Preemptive SJF
function scheduleSRTF() {
    const processQueue = processes.map(p => ({
        ...p,
        remainingTime: p.burstTime,
        startTime: -1
    }));

    let currentTime = 0;
    const timeline = [];
    const processResults = [];
    let completed = 0;
    const n = processQueue.length;

    while (completed < n) {
        const availableProcesses = processQueue.filter(
            p => p.arrivalTime <= currentTime && p.remainingTime > 0
        );

        if (availableProcesses.length === 0) {
            const nextArrival = processQueue
                .filter(p => p.remainingTime > 0)
                .reduce((min, p) => Math.min(min, p.arrivalTime), Infinity);
            
            timeline.push({
                process: 'Idle',
                start: currentTime,
                end: nextArrival,
                color: '#e0e0e0'
            });
            currentTime = nextArrival;
            continue;
        }

        const currentProcess = availableProcesses.reduce((min, p) => {
            if (p.remainingTime < min.remainingTime) return p;
            if (p.remainingTime === min.remainingTime && p.arrivalTime < min.arrivalTime) return p;
            return min;
        });

        if (currentProcess.startTime === -1) {
            currentProcess.startTime = currentTime;
        }

        // Execute for 1 time unit
        const lastBlock = timeline[timeline.length - 1];
        if (lastBlock && lastBlock.process === currentProcess.name && lastBlock.end === currentTime) {
            lastBlock.end = currentTime + 1;
        } else {
            timeline.push({
                process: currentProcess.name,
                start: currentTime,
                end: currentTime + 1,
                color: currentProcess.color
            });
        }

        currentProcess.remainingTime--;
        currentTime++;

        if (currentProcess.remainingTime === 0) {
            const completionTime = currentTime;
            const turnaroundTime = completionTime - currentProcess.arrivalTime;
            const waitingTime = turnaroundTime - currentProcess.burstTime;
            const responseTime = currentProcess.startTime - currentProcess.arrivalTime;

            processResults.push({
                ...currentProcess,
                completionTime,
                turnaroundTime,
                waitingTime,
                responseTime
            });
            completed++;
        }
    }

    return { timeline, processResults };
}

// Priority Scheduling (Non-preemptive)
function schedulePriority() {
    const remainingProcesses = [...processes];
    let currentTime = 0;
    const timeline = [];
    const processResults = [];
    
    // Get priority mode from dropdown
    const priorityModeValue = document.getElementById('priorityMode')?.value || 'low';

    while (remainingProcesses.length > 0) {
        const availableProcesses = remainingProcesses.filter(p => p.arrivalTime <= currentTime);

        if (availableProcesses.length === 0) {
            const nextProcess = remainingProcesses.reduce((min, p) =>
                p.arrivalTime < min.arrivalTime ? p : min
            );
            timeline.push({
                process: 'Idle',
                start: currentTime,
                end: nextProcess.arrivalTime,
                color: '#e0e0e0'
            });
            currentTime = nextProcess.arrivalTime;
            continue;
        }

        // Select process based on priority mode with FCFS tie-breaking
        const highestPriority = priorityModeValue === 'low'
            ? availableProcesses.reduce((max, p) => {
                if (p.priority < max.priority) return p;
                if (p.priority === max.priority && p.arrivalTime < max.arrivalTime) return p;
                return max;
              })
            : availableProcesses.reduce((max, p) => {
                if (p.priority > max.priority) return p;
                if (p.priority === max.priority && p.arrivalTime < max.arrivalTime) return p;
                return max;
              });

        const startTime = currentTime;
        const completionTime = startTime + highestPriority.burstTime;
        const turnaroundTime = completionTime - highestPriority.arrivalTime;
        const waitingTime = turnaroundTime - highestPriority.burstTime;
        const responseTime = startTime - highestPriority.arrivalTime;

        timeline.push({
            process: highestPriority.name,
            start: startTime,
            end: completionTime,
            color: highestPriority.color
        });

        processResults.push({
            ...highestPriority,
            completionTime,
            turnaroundTime,
            waitingTime,
            responseTime
        });

        currentTime = completionTime;
        remainingProcesses.splice(remainingProcesses.indexOf(highestPriority), 1);
    }

    return { timeline, processResults };
}

// Round Robin Scheduling
function scheduleRoundRobin(quantum) {
    const processQueue = processes.map(p => ({
        ...p,
        remainingTime: p.burstTime,
        startTime: -1
    })).sort((a, b) => a.arrivalTime - b.arrivalTime);

    let currentTime = 0;
    const timeline = [];
    const processResults = [];
    const readyQueue = [];
    let processIndex = 0;

    while (processIndex < processQueue.length || readyQueue.length > 0) {
        // Add newly arrived processes to ready queue
        while (processIndex < processQueue.length && processQueue[processIndex].arrivalTime <= currentTime) {
            readyQueue.push(processQueue[processIndex]);
            processIndex++;
        }

        if (readyQueue.length === 0) {
            const nextArrival = processQueue[processIndex].arrivalTime;
            timeline.push({
                process: 'Idle',
                start: currentTime,
                end: nextArrival,
                color: '#e0e0e0'
            });
            currentTime = nextArrival;
            continue;
        }

        const currentProcess = readyQueue.shift();

        if (currentProcess.startTime === -1) {
            currentProcess.startTime = currentTime;
        }

        const executeTime = Math.min(quantum, currentProcess.remainingTime);
        
        timeline.push({
            process: currentProcess.name,
            start: currentTime,
            end: currentTime + executeTime,
            color: currentProcess.color
        });

        currentTime += executeTime;
        currentProcess.remainingTime -= executeTime;

        // Add newly arrived processes
        while (processIndex < processQueue.length && processQueue[processIndex].arrivalTime <= currentTime) {
            readyQueue.push(processQueue[processIndex]);
            processIndex++;
        }

        if (currentProcess.remainingTime > 0) {
            readyQueue.push(currentProcess);
        } else {
            const completionTime = currentTime;
            const turnaroundTime = completionTime - currentProcess.arrivalTime;
            const waitingTime = turnaroundTime - currentProcess.burstTime;
            const responseTime = currentProcess.startTime - currentProcess.arrivalTime;

            processResults.push({
                ...currentProcess,
                completionTime,
                turnaroundTime,
                waitingTime,
                responseTime
            });
        }
    }

    return { timeline, processResults };
}

// Preemptive Priority Scheduling
function schedulePreemptivePriority() {
    const processStates = processes.map(p => ({
        ...p,
        remainingTime: p.burstTime,
        firstResponseTime: -1
    }));

    let currentTime = 0;
    const timeline = [];
    const processResults = [];
    let completed = 0;
    
    // Get priority mode from dropdown
    const priorityModeValue = document.getElementById('priorityMode')?.value || 'low';

    while (completed < processes.length) {
        // Find available processes
        const available = processStates.filter(p => 
            p.arrivalTime <= currentTime && p.remainingTime > 0
        );

        if (available.length === 0) {
            // CPU idle - jump to next arrival
            const nextArrival = processStates
                .filter(p => p.remainingTime > 0)
                .reduce((min, p) => Math.min(min, p.arrivalTime), Infinity);
            
            if (nextArrival !== Infinity) {
                timeline.push({
                    process: 'Idle',
                    start: currentTime,
                    end: nextArrival,
                    color: '#e0e0e0'
                });
                currentTime = nextArrival;
            }
            continue;
        }

        // Select highest priority process based on mode with FCFS tie-breaking
        const currentProcess = priorityModeValue === 'low'
            ? available.reduce((max, p) => {
                if (p.priority < max.priority) return p;
                if (p.priority === max.priority && p.arrivalTime < max.arrivalTime) return p;
                return max;
              })
            : available.reduce((max, p) => {
                if (p.priority > max.priority) return p;
                if (p.priority === max.priority && p.arrivalTime < max.arrivalTime) return p;
                return max;
              });

        // Record first response time
        if (currentProcess.firstResponseTime === -1) {
            currentProcess.firstResponseTime = currentTime;
        }

        // Execute for 1 time unit
        const lastBlock = timeline[timeline.length - 1];
        if (lastBlock && lastBlock.process === currentProcess.name && lastBlock.end === currentTime) {
            // Extend existing block
            lastBlock.end = currentTime + 1;
        } else {
            // Create new block
            timeline.push({
                process: currentProcess.name,
                start: currentTime,
                end: currentTime + 1,
                color: currentProcess.color
            });
        }

        currentProcess.remainingTime--;
        currentTime++;

        // Check if process completed
        if (currentProcess.remainingTime === 0) {
            const completionTime = currentTime;
            const turnaroundTime = completionTime - currentProcess.arrivalTime;
            const waitingTime = turnaroundTime - currentProcess.burstTime;
            const responseTime = currentProcess.firstResponseTime - currentProcess.arrivalTime;

            processResults.push({
                ...currentProcess,
                completionTime,
                turnaroundTime,
                waitingTime,
                responseTime
            });
            completed++;
        }
    }

    return { timeline, processResults };
}

// Priority Scheduling with Round Robin (for equal priority processes)
function schedulePriorityRR(quantum) {
    const processStates = processes.map(p => ({
        ...p,
        remainingTime: p.burstTime,
        firstResponseTime: -1,
        queueEntry: 0 // Track when process entered current priority level
    }));

    let currentTime = 0;
    const timeline = [];
    const processResults = [];
    const readyQueue = [];
    let processIndex = 0;
    let queueEntryCounter = 0;
    
    // Get priority mode from dropdown
    const priorityModeValue = document.getElementById('priorityMode')?.value || 'low';
    
    // Sort processes by arrival time
    const sortedProcesses = [...processStates].sort((a, b) => a.arrivalTime - b.arrivalTime);

    while (processResults.length < processes.length || readyQueue.length > 0) {
        // Add newly arrived processes to ready queue
        while (processIndex < sortedProcesses.length && sortedProcesses[processIndex].arrivalTime <= currentTime) {
            sortedProcesses[processIndex].queueEntry = queueEntryCounter++;
            readyQueue.push(sortedProcesses[processIndex]);
            processIndex++;
        }

        // Remove completed processes from ready queue
        const activeQueue = readyQueue.filter(p => p.remainingTime > 0);
        readyQueue.length = 0;
        readyQueue.push(...activeQueue);

        if (readyQueue.length === 0) {
            // CPU idle
            if (processIndex < sortedProcesses.length) {
                const nextArrival = sortedProcesses[processIndex].arrivalTime;
                timeline.push({
                    process: 'Idle',
                    start: currentTime,
                    end: nextArrival,
                    color: '#e0e0e0'
                });
                currentTime = nextArrival;
            }
            continue;
        }

        // Find the highest priority among ready processes
        let highestPriority;
        if (priorityModeValue === 'low') {
            highestPriority = Math.min(...readyQueue.map(p => p.priority));
        } else {
            highestPriority = Math.max(...readyQueue.map(p => p.priority));
        }
        
        // Get all processes with the highest priority (maintain insertion order for RR)
        const samePriorityProcesses = readyQueue
            .filter(p => p.priority === highestPriority)
            .sort((a, b) => a.queueEntry - b.queueEntry); // FIFO order within same priority
        
        // Execute the first process with highest priority
        const currentProcess = samePriorityProcesses[0];
        
        // Remove from ready queue
        const index = readyQueue.indexOf(currentProcess);
        readyQueue.splice(index, 1);

        // Record first response time
        if (currentProcess.firstResponseTime === -1) {
            currentProcess.firstResponseTime = currentTime;
        }

        // Execute for time quantum or remaining time
        const executeTime = Math.min(quantum, currentProcess.remainingTime);
        
        timeline.push({
            process: currentProcess.name,
            start: currentTime,
            end: currentTime + executeTime,
            color: currentProcess.color
        });

        currentTime += executeTime;
        currentProcess.remainingTime -= executeTime;

        // Add newly arrived processes during execution
        while (processIndex < sortedProcesses.length && sortedProcesses[processIndex].arrivalTime <= currentTime) {
            sortedProcesses[processIndex].queueEntry = queueEntryCounter++;
            readyQueue.push(sortedProcesses[processIndex]);
            processIndex++;
        }

        // Check if process completed
        if (currentProcess.remainingTime === 0) {
            const completionTime = currentTime;
            const turnaroundTime = completionTime - currentProcess.arrivalTime;
            const waitingTime = turnaroundTime - currentProcess.burstTime;
            const responseTime = currentProcess.firstResponseTime - currentProcess.arrivalTime;

            processResults.push({
                ...currentProcess,
                completionTime,
                turnaroundTime,
                waitingTime,
                responseTime
            });
        } else {
            // Process not complete, add back to ready queue with new entry time
            currentProcess.queueEntry = queueEntryCounter++;
            readyQueue.push(currentProcess);
        }
    }

    return { timeline, processResults };
}

// Display results
function displayResults(results) {
    const { timeline, processResults } = results;

    // Show results section
    document.getElementById('resultsSection').style.display = 'block';

    // Generate Gantt Chart
    generateGanttChart(timeline);

    // Calculate and display metrics with safety checks
    const totalTime = timeline.length > 0 ? Math.max(...timeline.map(t => t.end)) : 0;
    const idleTime = timeline.filter(t => t.process === 'Idle').reduce((sum, t) => sum + (t.end - t.start), 0);
    
    // Protect against division by zero
    const avgWaitingTime = processResults.length > 0 
        ? (processResults.reduce((sum, p) => sum + p.waitingTime, 0) / processResults.length).toFixed(2) 
        : '0.00';
    const avgTurnaroundTime = processResults.length > 0 
        ? (processResults.reduce((sum, p) => sum + p.turnaroundTime, 0) / processResults.length).toFixed(2) 
        : '0.00';
    const avgResponseTime = processResults.length > 0 
        ? (processResults.reduce((sum, p) => sum + p.responseTime, 0) / processResults.length).toFixed(2) 
        : '0.00';
    const cpuUtilization = totalTime > 0 
        ? (((totalTime - idleTime) / totalTime) * 100).toFixed(2) 
        : '0.00';

    document.getElementById('avgWaitingTime').textContent = avgWaitingTime;
    document.getElementById('avgTurnaroundTime').textContent = avgTurnaroundTime;
    document.getElementById('avgResponseTime').textContent = avgResponseTime;
    document.getElementById('cpuUtilization').textContent = cpuUtilization + '%';

    // Display detailed results table
    displayResultsTable(processResults);

    // Generate additional visualizations
    generateWaitingTimeChart(processResults);
    generateTurnaroundTimeChart(processResults);
    generateStateStats(processResults, timeline);

    // Scroll to results
    document.getElementById('resultsSection').scrollIntoView({ behavior: 'smooth' });
}

// Generate Gantt Chart
function generateGanttChart(timeline) {
    const ganttBars = document.getElementById('ganttBars');
    const ganttTimeline = document.getElementById('ganttTimeline');
    
    // Safety check - ensure elements exist
    if (!ganttBars || !ganttTimeline) {
        console.error('Gantt chart elements not found. Please refresh the page (Ctrl+Shift+R).');
        return;
    }
    
    // Safety check - ensure timeline is valid
    if (!timeline || timeline.length === 0) {
        console.error('Timeline is empty or invalid.');
        ganttBars.innerHTML = '<div style="padding: 20px; text-align: center; color: #666;">No timeline data available</div>';
        return;
    }
    
    ganttBars.innerHTML = '';
    ganttTimeline.innerHTML = '';

    const totalTime = Math.max(...timeline.map(t => t.end));
    
    // Safety check - ensure totalTime is valid
    if (totalTime === 0 || !isFinite(totalTime)) {
        console.error('Invalid total time:', totalTime);
        return;
    }

    // Create process bars with percentage-based positioning
    timeline.forEach(block => {
        const startPercent = (block.start / totalTime) * 100;
        const widthPercent = ((block.end - block.start) / totalTime) * 100;
        
        const ganttBar = document.createElement('div');
        ganttBar.className = 'gantt-bar';
        ganttBar.style.left = `${startPercent}%`;
        ganttBar.style.width = `${widthPercent}%`;
        ganttBar.style.background = block.color;
        ganttBar.textContent = block.process;
        ganttBar.title = `${block.process}: ${block.start} - ${block.end} (Duration: ${block.end - block.start})`;
        ganttBars.appendChild(ganttBar);
    });

    // Create timeline ticks only at process boundaries
    const boundaryTimes = new Set();
    timeline.forEach(block => {
        boundaryTimes.add(block.start);
        boundaryTimes.add(block.end);
    });
    
    // Convert to sorted array
    const sortedBoundaries = Array.from(boundaryTimes).sort((a, b) => a - b);
    
    // Create ticks only at boundary points
    sortedBoundaries.forEach((time, index) => {
        const positionPercent = (time / totalTime) * 100;
        
        // Create tick container
        const tick = document.createElement('div');
        tick.className = 'timeline-tick';
        tick.style.left = `${positionPercent}%`;
        
        // Special positioning for first and last ticks to keep them visible
        if (index === 0) {
            tick.classList.add('timeline-tick-first');
        } else if (index === sortedBoundaries.length - 1) {
            tick.classList.add('timeline-tick-last');
        }
        
        // Create vertical line
        const tickLine = document.createElement('div');
        tickLine.className = 'tick-line';
        tick.appendChild(tickLine);
        
        // Create time label
        const tickLabel = document.createElement('div');
        tickLabel.className = 'tick-label';
        tickLabel.textContent = time;
        tick.appendChild(tickLabel);
        
        ganttTimeline.appendChild(tick);
    });
}

// Display results table
function displayResultsTable(processResults) {
    const tbody = document.getElementById('resultsTableBody');
    tbody.innerHTML = '';

    processResults.sort((a, b) => a.id - b.id).forEach(process => {
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td><span style="display: inline-block; width: 12px; height: 12px; background: ${process.color}; border-radius: 50%; margin-right: 8px;"></span>${process.name}</td>
            <td>${process.arrivalTime}</td>
            <td>${process.burstTime}</td>
            <td>${process.completionTime}</td>
            <td>${process.turnaroundTime}</td>
            <td>${process.waitingTime}</td>
            <td>${process.responseTime}</td>
        `;
        tbody.appendChild(row);
    });
}

// Generate Waiting Time Pie Chart
function generateWaitingTimeChart(processResults) {
    const svg = document.getElementById('waitingTimeSVG');
    const legend = document.getElementById('waitingTimeLegend');
    svg.innerHTML = '';
    legend.innerHTML = '';

    const centerX = 150;
    const centerY = 150;
    const radius = 100;

    // Prepare data
    const data = processResults.map(p => ({
        label: p.name,
        value: p.waitingTime,
        color: p.color
    }));

    const total = data.reduce((sum, item) => sum + item.value, 0);
    
    if (total === 0) {
        svg.innerHTML = '<text x="150" y="150" text-anchor="middle" fill="#64748b" font-size="14">No waiting time</text>';
        return;
    }

    let currentAngle = -90;

    data.forEach(item => {
        if (item.value === 0) return;

        const sliceAngle = (item.value / total) * 360;
        const endAngle = currentAngle + sliceAngle;
        
        const startRad = (currentAngle * Math.PI) / 180;
        const endRad = (endAngle * Math.PI) / 180;
        
        const x1 = centerX + radius * Math.cos(startRad);
        const y1 = centerY + radius * Math.sin(startRad);
        const x2 = centerX + radius * Math.cos(endRad);
        const y2 = centerY + radius * Math.sin(endRad);
        
        const largeArc = sliceAngle > 180 ? 1 : 0;
        
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        const d = `M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;
        path.setAttribute('d', d);
        path.setAttribute('fill', item.color);
        path.setAttribute('stroke', 'white');
        path.setAttribute('stroke-width', '3');
        path.style.transition = 'all 0.3s ease';
        path.style.cursor = 'pointer';
        
        path.addEventListener('mouseenter', function() {
            this.style.opacity = '0.8';
        });
        
        path.addEventListener('mouseleave', function() {
            this.style.opacity = '1';
        });
        
        svg.appendChild(path);
        
        currentAngle = endAngle;

        // Add legend item
        const legendItem = document.createElement('div');
        legendItem.className = 'legend-item';
        legendItem.innerHTML = `
            <div class="legend-color" style="background: ${item.color};"></div>
            <span class="legend-label">${item.label}:</span>
            <span class="legend-value">${item.value} units (${((item.value / total) * 100).toFixed(1)}%)</span>
        `;
        legend.appendChild(legendItem);
    });

    // Add center circle for donut effect
    const centerCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    centerCircle.setAttribute('cx', centerX);
    centerCircle.setAttribute('cy', centerY);
    centerCircle.setAttribute('r', '60');
    centerCircle.setAttribute('fill', 'white');
    svg.appendChild(centerCircle);

    // Add total text in center
    const totalText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    totalText.setAttribute('x', centerX);
    totalText.setAttribute('y', centerY - 5);
    totalText.setAttribute('text-anchor', 'middle');
    totalText.setAttribute('fill', '#1e40af');
    totalText.setAttribute('font-size', '24');
    totalText.setAttribute('font-weight', 'bold');
    totalText.textContent = total;
    svg.appendChild(totalText);

    const labelText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    labelText.setAttribute('x', centerX);
    labelText.setAttribute('y', centerY + 15);
    labelText.setAttribute('text-anchor', 'middle');
    labelText.setAttribute('fill', '#64748b');
    labelText.setAttribute('font-size', '12');
    labelText.textContent = 'Total WT';
    svg.appendChild(labelText);
}

// Generate Turnaround Time Pie Chart
function generateTurnaroundTimeChart(processResults) {
    const svg = document.getElementById('turnaroundTimeSVG');
    const legend = document.getElementById('turnaroundTimeLegend');
    svg.innerHTML = '';
    legend.innerHTML = '';

    const centerX = 150;
    const centerY = 150;
    const radius = 100;

    // Prepare data
    const data = processResults.map(p => ({
        label: p.name,
        value: p.turnaroundTime,
        color: p.color
    }));

    const total = data.reduce((sum, item) => sum + item.value, 0);
    
    if (total === 0) {
        svg.innerHTML = '<text x="150" y="150" text-anchor="middle" fill="#64748b" font-size="14">No turnaround time</text>';
        return;
    }

    let currentAngle = -90;

    data.forEach(item => {
        if (item.value === 0) return;

        const sliceAngle = (item.value / total) * 360;
        const endAngle = currentAngle + sliceAngle;
        
        const startRad = (currentAngle * Math.PI) / 180;
        const endRad = (endAngle * Math.PI) / 180;
        
        const x1 = centerX + radius * Math.cos(startRad);
        const y1 = centerY + radius * Math.sin(startRad);
        const x2 = centerX + radius * Math.cos(endRad);
        const y2 = centerY + radius * Math.sin(endRad);
        
        const largeArc = sliceAngle > 180 ? 1 : 0;
        
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        const d = `M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;
        path.setAttribute('d', d);
        path.setAttribute('fill', item.color);
        path.setAttribute('stroke', 'white');
        path.setAttribute('stroke-width', '3');
        path.style.transition = 'all 0.3s ease';
        path.style.cursor = 'pointer';
        
        path.addEventListener('mouseenter', function() {
            this.style.opacity = '0.8';
        });
        
        path.addEventListener('mouseleave', function() {
            this.style.opacity = '1';
        });
        
        svg.appendChild(path);
        
        currentAngle = endAngle;

        // Add legend item
        const legendItem = document.createElement('div');
        legendItem.className = 'legend-item';
        legendItem.innerHTML = `
            <div class="legend-color" style="background: ${item.color};"></div>
            <span class="legend-label">${item.label}:</span>
            <span class="legend-value">${item.value} units (${((item.value / total) * 100).toFixed(1)}%)</span>
        `;
        legend.appendChild(legendItem);
    });

    // Add center circle for donut effect
    const centerCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    centerCircle.setAttribute('cx', centerX);
    centerCircle.setAttribute('cy', centerY);
    centerCircle.setAttribute('r', '60');
    centerCircle.setAttribute('fill', 'white');
    svg.appendChild(centerCircle);

    // Add total text in center
    const totalText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    totalText.setAttribute('x', centerX);
    totalText.setAttribute('y', centerY - 5);
    totalText.setAttribute('text-anchor', 'middle');
    totalText.setAttribute('fill', '#1e40af');
    totalText.setAttribute('font-size', '24');
    totalText.setAttribute('font-weight', 'bold');
    totalText.textContent = total;
    svg.appendChild(totalText);

    const labelText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    labelText.setAttribute('x', centerX);
    labelText.setAttribute('y', centerY + 15);
    labelText.setAttribute('text-anchor', 'middle');
    labelText.setAttribute('fill', '#64748b');
    labelText.setAttribute('font-size', '12');
    labelText.textContent = 'Total TAT';
    svg.appendChild(labelText);
}

// Generate Bar Chart for Process Metrics Comparison
function generateBarChart(processResults) {
    const barChart = document.getElementById('barChart');
    barChart.innerHTML = '';

    const maxValue = Math.max(
        ...processResults.map(p => Math.max(p.waitingTime, p.turnaroundTime, p.burstTime))
    );

    processResults.sort((a, b) => a.id - b.id).forEach(process => {
        // Waiting Time Bar
        const waitingItem = document.createElement('div');
        waitingItem.className = 'bar-item';
        const waitingWidth = (process.waitingTime / maxValue) * 100;
        waitingItem.innerHTML = `
            <div class="bar-label">${process.name}</div>
            <div class="bar-wrapper">
                <div class="bar" style="width: ${waitingWidth}%; background: linear-gradient(90deg, #f59e0b, #d97706);">
                    ${process.waitingTime}
                </div>
                <div class="bar-value">WT: ${process.waitingTime}</div>
            </div>
        `;
        barChart.appendChild(waitingItem);

        // Turnaround Time Bar
        const tatItem = document.createElement('div');
        tatItem.className = 'bar-item';
        const tatWidth = (process.turnaroundTime / maxValue) * 100;
        tatItem.innerHTML = `
            <div class="bar-label"></div>
            <div class="bar-wrapper">
                <div class="bar" style="width: ${tatWidth}%; background: linear-gradient(90deg, #3b82f6, #2563eb);">
                    ${process.turnaroundTime}
                </div>
                <div class="bar-value">TAT: ${process.turnaroundTime}</div>
            </div>
        `;
        barChart.appendChild(tatItem);
    });

    // Add legend
    const legend = document.createElement('div');
    legend.style.cssText = 'display: flex; gap: 20px; margin-top: 15px; justify-content: center; font-size: 0.9em;';
    legend.innerHTML = `
        <div style="display: flex; align-items: center; gap: 8px;">
            <div style="width: 20px; height: 12px; background: linear-gradient(90deg, #f59e0b, #d97706); border-radius: 3px;"></div>
            <span>Waiting Time (WT)</span>
        </div>
        <div style="display: flex; align-items: center; gap: 8px;">
            <div style="width: 20px; height: 12px; background: linear-gradient(90deg, #3b82f6, #2563eb); border-radius: 3px;"></div>
            <span>Turnaround Time (TAT)</span>
        </div>
    `;
    barChart.appendChild(legend);
}

// Generate Pie Chart for Time Distribution
function generatePieChart(processResults, totalTime, idleTime) {
    const svg = document.getElementById('pieChartSVG');
    const legend = document.getElementById('pieChartLegend');
    svg.innerHTML = '';
    legend.innerHTML = '';

    const centerX = 150;
    const centerY = 150;
    const radius = 100;

    // Calculate execution times
    const executionTime = totalTime - idleTime;
    const data = [
        { label: 'Execution Time', value: executionTime, color: '#10b981' },
        { label: 'Waiting Time', value: processResults.reduce((sum, p) => sum + p.waitingTime, 0) / processResults.length, color: '#f59e0b' },
        { label: 'Idle Time', value: idleTime, color: '#ef4444' }
    ];

    const total = data.reduce((sum, item) => sum + item.value, 0);
    let currentAngle = -90;

    data.forEach(item => {
        const sliceAngle = (item.value / total) * 360;
        const endAngle = currentAngle + sliceAngle;
        
        const startRad = (currentAngle * Math.PI) / 180;
        const endRad = (endAngle * Math.PI) / 180;
        
        const x1 = centerX + radius * Math.cos(startRad);
        const y1 = centerY + radius * Math.sin(startRad);
        const x2 = centerX + radius * Math.cos(endRad);
        const y2 = centerY + radius * Math.sin(endRad);
        
        const largeArc = sliceAngle > 180 ? 1 : 0;
        
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        const d = `M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;
        path.setAttribute('d', d);
        path.setAttribute('fill', item.color);
        path.setAttribute('stroke', 'white');
        path.setAttribute('stroke-width', '2');
        path.style.transition = 'all 0.3s ease';
        path.style.cursor = 'pointer';
        
        path.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.05)';
            this.style.transformOrigin = `${centerX}px ${centerY}px`;
        });
        
        path.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1)';
        });
        
        svg.appendChild(path);
        
        currentAngle = endAngle;

        // Add legend item
        const legendItem = document.createElement('div');
        legendItem.className = 'legend-item';
        legendItem.innerHTML = `
            <div class="legend-color" style="background: ${item.color};"></div>
            <span class="legend-label">${item.label}:</span>
            <span class="legend-value">${item.value.toFixed(1)} (${((item.value / total) * 100).toFixed(1)}%)</span>
        `;
        legend.appendChild(legendItem);
    });
}

// Generate State Statistics
function generateStateStats(processResults, timeline) {
    const stateStats = document.getElementById('stateStats');
    stateStats.innerHTML = '';

    const totalProcesses = processResults.length;
    const completedProcesses = processResults.filter(p => p.completionTime > 0).length;
    const avgBurstTime = (processResults.reduce((sum, p) => sum + p.burstTime, 0) / totalProcesses).toFixed(2);
    const contextSwitches = timeline.length - 1;

    const stats = [
        { label: 'Total Processes', value: totalProcesses },
        { label: 'Completed', value: completedProcesses },
        { label: 'Avg Burst Time', value: avgBurstTime },
        { label: 'Context Switches', value: contextSwitches }
    ];

    stats.forEach(stat => {
        const statDiv = document.createElement('div');
        statDiv.className = 'state-stat';
        statDiv.innerHTML = `
            <div class="state-stat-label">${stat.label}</div>
            <div class="state-stat-value">${stat.value}</div>
        `;
        stateStats.appendChild(statDiv);
    });
}
