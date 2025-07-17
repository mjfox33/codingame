const fs = require('fs');

// Read commands.txt
const rawData = fs.readFileSync('commands.txt', 'utf8').trim();
const commands = rawData.split('\n').map(line => 
  line.split(',').map(cmd => {
    const [angle, thrust] = cmd.trim().split(' ').map(Number);
    return `[${angle}, ${thrust}]`;
  })
);

// Format for CodinGame
const output = `const commands = [\n${commands.map(cmd => `  [${cmd.join(', ')}]`).join(',\n')}\n];`;

// Write to commands2.txt
fs.writeFileSync('commands2.txt', output);
