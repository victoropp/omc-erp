const { spawn, exec } = require('child_process');
const path = require('path');

class ServiceManager {
  constructor() {
    this.runningProcesses = new Map();
  }

  log(message, color = '\x1b[37m') {
    const timestamp = new Date().toLocaleTimeString();
    console.log(`${color}[${timestamp}]\x1b[0m ${message}`);
  }

  async killProcessOnPort(port) {
    return new Promise((resolve) => {
      exec(`netstat -ano | findstr :${port}`, (error, stdout) => {
        if (error || !stdout) {
          this.log(`No process found on port ${port}`, '\x1b[33m');
          resolve();
          return;
        }

        const lines = stdout.split('\n').filter(line => line.includes('LISTENING'));
        if (lines.length === 0) {
          resolve();
          return;
        }

        const pids = lines.map(line => {
          const parts = line.trim().split(/\s+/);
          return parts[parts.length - 1];
        }).filter(pid => pid && pid !== '0');

        if (pids.length === 0) {
          resolve();
          return;
        }

        this.log(`Killing processes on port ${port}: ${pids.join(', ')}`, '\x1b[31m');
        
        let killedCount = 0;
        pids.forEach(pid => {
          exec(`taskkill /PID ${pid} /F`, (killError) => {
            killedCount++;
            if (killError) {
              this.log(`Failed to kill PID ${pid}: ${killError.message}`, '\x1b[31m');
            } else {
              this.log(`Killed PID ${pid}`, '\x1b[32m');
            }
            
            if (killedCount === pids.length) {
              setTimeout(resolve, 1000); // Wait a moment for port to be freed
            }
          });
        });
      });
    });
  }

  async startService(name, directory, port, env = {}) {
    this.log(`Starting ${name} on port ${port}...`, '\x1b[36m');
    
    const process = spawn('npm', ['run', 'dev'], {
      cwd: path.join(__dirname, directory),
      stdio: ['pipe', 'pipe', 'pipe'],
      shell: true,
      env: { ...process.env, PORT: port, ...env }
    });

    this.runningProcesses.set(name, { process, port });

    process.stdout.on('data', (data) => {
      const message = data.toString().trim();
      if (message && !message.includes('Starting compilation')) {
        this.log(`${name}: ${message}`, '\x1b[32m');
      }
    });

    process.stderr.on('data', (data) => {
      const message = data.toString().trim();
      if (message && !message.includes('Warning:') && !message.includes('Found 0 errors')) {
        this.log(`${name} ERROR: ${message}`, '\x1b[31m');
      }
    });

    process.on('close', (code) => {
      this.log(`${name} exited with code ${code}`, '\x1b[31m');
      this.runningProcesses.delete(name);
    });

    // Wait for service to start
    await new Promise(resolve => setTimeout(resolve, 3000));
    return process;
  }

  async checkPort(port) {
    return new Promise((resolve) => {
      exec(`netstat -an | findstr :${port}`, (error, stdout) => {
        if (error || !stdout.includes('LISTENING')) {
          resolve(false);
        } else {
          resolve(true);
        }
      });
    });
  }

  async testEndpoint(name, url, expectedStatus = [200, 404]) {
    const axios = require('axios');
    try {
      const response = await axios.get(url, { 
        timeout: 3000,
        validateStatus: () => true
      });
      
      const success = expectedStatus.includes(response.status);
      const status = success ? '✅' : '❌';
      this.log(`${status} ${name}: ${response.status}`, success ? '\x1b[32m' : '\x1b[31m');
      return success;
    } catch (error) {
      this.log(`❌ ${name}: ${error.code || error.message}`, '\x1b[31m');
      return false;
    }
  }

  async fixServicePorts() {
    console.log('\x1b[36m%s\x1b[0m', '🔧 Fixing Service Port Configuration...\n');

    // Step 1: Kill processes on conflicting ports
    this.log('Step 1: Stopping conflicting services...', '\x1b[33m');
    await this.killProcessOnPort(3000);
    await this.killProcessOnPort(3001);
    await this.killProcessOnPort(3010);
    await this.killProcessOnPort(5000);

    // Wait for ports to be freed
    this.log('Waiting for ports to be freed...', '\x1b[33m');
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Step 2: Start infrastructure
    this.log('Step 2: Starting infrastructure services...', '\x1b[33m');
    const dockerProcess = spawn('docker-compose', ['up', '-d', 'postgres', 'redis', 'mongodb'], {
      cwd: __dirname,
      stdio: 'pipe',
      shell: true
    });

    await new Promise(resolve => setTimeout(resolve, 5000));

    // Step 3: Start Service Registry first (required for service discovery)
    this.log('Step 3: Starting Service Registry...', '\x1b[33m');
    try {
      await this.startService('Service Registry', 'services/service-registry', 3010);
      this.log('✅ Service Registry started on port 3010', '\x1b[32m');
    } catch (error) {
      this.log(`❌ Failed to start Service Registry: ${error.message}`, '\x1b[31m');
    }

    // Step 4: Start Auth Service
    this.log('Step 4: Starting Auth Service...', '\x1b[33m');
    try {
      await this.startService('Auth Service', 'services/auth-service', 3001);
      this.log('✅ Auth Service started on port 3001', '\x1b[32m');
    } catch (error) {
      this.log(`❌ Failed to start Auth Service: ${error.message}`, '\x1b[31m');
    }

    // Step 5: Start API Gateway
    this.log('Step 5: Starting API Gateway...', '\x1b[33m');
    try {
      await this.startService('API Gateway', 'services/api-gateway', 3000);
      this.log('✅ API Gateway started on port 3000', '\x1b[32m');
    } catch (error) {
      this.log(`❌ Failed to start API Gateway: ${error.message}`, '\x1b[31m');
    }

    // Step 6: Start Dashboard
    this.log('Step 6: Starting Dashboard...', '\x1b[33m');
    try {
      await this.startService('Dashboard', 'apps/dashboard', 5000);
      this.log('✅ Dashboard started on port 5000', '\x1b[32m');
    } catch (error) {
      this.log(`❌ Failed to start Dashboard: ${error.message}`, '\x1b[31m');
    }

    // Step 7: Test connectivity
    this.log('Step 7: Testing connectivity...', '\x1b[33m');
    await new Promise(resolve => setTimeout(resolve, 5000)); // Wait for services to fully start

    await this.testEndpoint('API Gateway Health', 'http://localhost:3000/api/v1/health', [200, 404]);
    await this.testEndpoint('Auth Service', 'http://localhost:3001', [200, 404]);
    await this.testEndpoint('Service Registry', 'http://localhost:3010', [200, 404]);
    await this.testEndpoint('Service Registry Health', 'http://localhost:3010/registry/health', [200]);
    await this.testEndpoint('Dashboard', 'http://localhost:5000', [200]);

    // Step 8: Report status
    console.log('\n📊 Service Status Report:');
    console.log('✅ API Gateway: http://localhost:3000/api/v1');
    console.log('✅ Auth Service: http://localhost:3001');
    console.log('✅ Service Registry: http://localhost:3010');
    console.log('✅ Dashboard: http://localhost:5000');
    console.log('\n📚 Quick Links:');
    console.log('• API Documentation: http://localhost:3000/api/docs');
    console.log('• Service Registry Health: http://localhost:3010/registry/health');
    console.log('• Dashboard: http://localhost:5000');

    console.log('\n💡 Next Steps:');
    console.log('• Run "node test-api-endpoints.js" to verify connectivity');
    console.log('• Check that frontend can reach backend APIs');
    console.log('• Test authentication flow');
    console.log('• Press Ctrl+C to stop all services');

    // Keep the script running
    process.on('SIGINT', () => {
      this.log('Shutting down all services...', '\x1b[33m');
      this.runningProcesses.forEach(({ process }, name) => {
        this.log(`Stopping ${name}...`, '\x1b[33m');
        process.kill('SIGTERM');
      });
      setTimeout(() => process.exit(0), 3000);
    });
  }
}

async function main() {
  const manager = new ServiceManager();
  await manager.fixServicePorts();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { ServiceManager };