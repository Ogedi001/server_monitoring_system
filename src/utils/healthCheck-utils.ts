import * as os from "os";
import disk from "diskusage";
import Logger from "../logger";

export function checkCpuUsage() {
    const cpus = os.cpus();
    let totalIdle = 0,
        totalTick = 0;

    for (let i = 0, len = cpus.length; i < len; i++) {
        const cpu = cpus[i];
        for (let type in cpu.times) {
            totalTick += cpu.times[type as keyof typeof cpu.times];
        }
        totalIdle += cpu.times.idle;
    }

    const idle = totalIdle / cpus.length;
    const total = totalTick / cpus.length;
    const usage = 1 - idle / total;
    const cpuUsagePercentage = parseFloat((usage * 100).toFixed(2));
    const isCpuUnderLoad = usage < 0.8;

    return {
        isCpuUnderLoad,
        cpuUsagePercentage,
    };
}

export function checkMemoryUsage() {
    const totalMemory = os.totalmem();
    const freeMemory = os.freemem();
    const usedMemory = totalMemory - freeMemory;
    const usage = usedMemory / totalMemory;
    const memoryUsagePercentage = parseFloat((usage * 100).toFixed(2));
    const isMemoryUnderLoad = usage < 0.8;

    return {
        isMemoryUnderLoad,
        memoryUsagePercentage,
    };
}

export function checkSystemHealth() {
    // Placeholder for additional health checks
    // checkDatabase();
    // checkExternalApi();

    const { isCpuUnderLoad, cpuUsagePercentage } = checkCpuUsage();
    const { isMemoryUnderLoad, memoryUsagePercentage } = checkMemoryUsage();

    if (!isMemoryUnderLoad) {
        Logger.warn(`High memory usage: ${memoryUsagePercentage} %`, {
            label: "metrics",
        });
    }

    if (!isCpuUnderLoad) {
        Logger.warn(`High CPU usage: ${cpuUsagePercentage} %`, {
            label: "metrics",
        });
    }

    return isCpuUnderLoad && isMemoryUnderLoad;
}

export async function disksInfo() {
    let path = os.platform() === "win32" ? "c:" : "/";
    try {
        const { total, free, available } = await disk.check(path);
        const used = total - available;
        const usagePercentage = parseFloat(((used / total) * 100).toFixed(2));
        return {
            total,
            used,
            free,
            available,
            usagePercentage,
        };
    } catch (error) {
        Logger.error(`Error checking disk usage: ${error}`, { label: "metrics" });
        return null;
    }
}