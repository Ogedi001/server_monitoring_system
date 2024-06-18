import * as os from "os";
import disk from "diskusage";
import Logger from "../logger";
import si, { Systeminformation } from "systeminformation";

export async function cpuLoadInfo() {
    let { currentLoad, currentLoadUser, currentLoadSystem } =
        await si.currentLoad();
    const isCpuUnderLoad = currentLoad < 80;

    return {
        currentLoad: parseFloat(currentLoad.toFixed(2)),
        currentLoadUser: parseFloat(currentLoadUser.toFixed(2)),
        currentLoadSystem: parseFloat(currentLoadSystem.toFixed(2)),
        isCpuUnderLoad,
    };
}

export async function memoryUsageInfo() {
    const { total, available } = await si.mem();
    const used = total - available
    // Calculate memory percentages
    const memoryUsagePercentage = parseFloat(((used / total) * 100).toFixed(2));
    const availableMemoryPercentage = parseFloat(
        ((available / total) * 100).toFixed(2)
    );

    // Check if memory is under load
    const isMemoryUnderLoad = memoryUsagePercentage < 80;

    return {
        totalMemory: total,
        availableMemoryPercentage,
        memoryUsagePercentage,
        isMemoryUnderLoad,
    };
}

export async function checkSystemHealth() {
    // Placeholder for additional health checks
    // checkDatabase();
    // checkExternalApi();

    const { isCpuUnderLoad, currentLoad } = await cpuLoadInfo();
    const { isMemoryUnderLoad, memoryUsagePercentage } = await memoryUsageInfo();

    if (!isMemoryUnderLoad) {
        Logger.warn(`High memory usage: ${memoryUsagePercentage} %`, {
            label: "metrics",
        });
    }

    if (!isCpuUnderLoad) {
        Logger.warn(`High CPU usage: ${currentLoad} %`, {
            label: "metrics",
        });
    }

    return isCpuUnderLoad && isMemoryUnderLoad;
}

export async function disksMetricsInfo() {
    let path = os.platform() === "win32" ? "c:" : "/";
    try {
        const { total, available } = await disk.check(path);
        const used = total - available;
        const usagePercentage = parseFloat(((used / total) * 100).toFixed(2));
        const availablePercentage = parseFloat(((available / total) * 100).toFixed(2));
        return {
            total,
            used,
            availablePercentage,
            usagePercentage,
        };
    } catch (error) {
        Logger.error(`Error checking disk usage: ${error}`, { label: "metrics" });
        return null;
    }
}



export async function networkMetricsInfo() {
    const networkStats = await si.networkStats();
    const networkInterfaces = await si.networkInterfaces() as Systeminformation.NetworkInterfacesData[];

    let totalReceived = 0;
    let totalSent = 0;

    networkStats.forEach((stat) => {
        totalReceived += stat.rx_bytes;
        totalSent += stat.tx_bytes;
    });
    return {
        networkInterfaces: networkInterfaces.length,
        totalReceived,
        totalSent
    }
}




//Same output as current load from systeminformation.currentLoad()
// export function checkCpuUsage() {
//     const cpus = os.cpus();
//     let totalIdle = 0,
//         totalTick = 0;

//     for (let i = 0, len = cpus.length; i < len; i++) {
//         const cpu = cpus[i];
//         for (let type in cpu.times) {
//             totalTick += cpu.times[type as keyof typeof cpu.times];
//         }
//         totalIdle += cpu.times.idle;
//     }

//     const idle = totalIdle / cpus.length;
//     const total = totalTick / cpus.length;
//     const usage = 1 - idle / total;
//     const cpuUsagePercentage = parseFloat((usage * 100).toFixed(2));
//     const isCpuUnderLoad = usage < 0.8;

//     return {
//         isCpuUnderLoad,
//         cpuUsagePercentage,
//     };
// }
