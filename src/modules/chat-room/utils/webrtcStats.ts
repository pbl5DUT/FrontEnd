/**
 * Utility functions for WebRTC call statistics and monitoring
 */

type CallStatsType = {
  bitrate?: number;
  packetLoss?: number;
  jitter?: number;
  roundTripTime?: number;
  qualityRating?: 'excellent' | 'good' | 'fair' | 'poor';
};

type StatsHistoryType = {
  timestamps: number[];
  bytesReceived: number[];
  packetLoss: number[];
  jitter: number[];
  roundTripTime: number[];
  qualityRatings: ('excellent' | 'good' | 'fair' | 'poor')[];
};

// Keep a cache of stats history to calculate trends
const statsHistory: Record<string, StatsHistoryType> = {};

/**
 * Collect WebRTC statistics from a peer connection
 * @param peerConnection The RTCPeerConnection to collect stats from
 * @param connectionId Unique identifier for the connection
 * @returns Promise resolving to call statistics object
 */
export async function collectWebRTCStats(
  peerConnection: RTCPeerConnection,
  connectionId: string
): Promise<CallStatsType | null> {
  if (!peerConnection || peerConnection.connectionState !== 'connected') {
    return null;
  }

  try {
    // Initialize history for this connection if it doesn't exist
    if (!statsHistory[connectionId]) {
      statsHistory[connectionId] = {
        timestamps: [],
        bytesReceived: [],
        packetLoss: [],
        jitter: [],
        roundTripTime: [],
        qualityRatings: []
      };
    }

    const history = statsHistory[connectionId];
    const stats = await peerConnection.getStats();
    
    let inboundRtp: any = null;
    let candidatePair: any = null;
    
    // Process all stats reports
    stats.forEach((report: any) => {
      if (report.type === 'inbound-rtp' && !report.isRemote) {
        inboundRtp = report;
      } else if (report.type === 'candidate-pair' && report.state === 'succeeded') {
        candidatePair = report;
      }
    });
    
    // Initialize statistics
    let bitrate = 0;
    let packetLoss = 0;
    let jitter = 0;
    let roundTripTime = 0;
    
    const now = Date.now();
    
    // Calculate bitrate based on bytes received
    if (inboundRtp) {
      const bytesNow = inboundRtp.bytesReceived;
      history.bytesReceived.push(bytesNow);
      history.timestamps.push(now);
      
      // Only calculate if we have at least two data points
      if (history.bytesReceived.length >= 2) {
        const lastBytes = history.bytesReceived[history.bytesReceived.length - 2];
        const lastTime = history.timestamps[history.timestamps.length - 2];
        
        // Time delta in seconds
        const timeDelta = (now - lastTime) / 1000;
        
        if (timeDelta > 0) {
          bitrate = 8 * (bytesNow - lastBytes) / timeDelta; // Convert to bits per second
        }
      }
      
      // Get packet loss info
      if (inboundRtp.packetsLost !== undefined && inboundRtp.packetsReceived) {
        const totalPackets = inboundRtp.packetsLost + inboundRtp.packetsReceived;
        packetLoss = totalPackets > 0 ? (inboundRtp.packetsLost / totalPackets) * 100 : 0;
        history.packetLoss.push(packetLoss);
      }
      
      // Get jitter (in seconds, convert to ms)
      if (inboundRtp.jitter !== undefined) {
        jitter = inboundRtp.jitter * 1000;
        history.jitter.push(jitter);
      }
    }
    
    // Get round-trip time
    if (candidatePair && candidatePair.currentRoundTripTime !== undefined) {
      roundTripTime = candidatePair.currentRoundTripTime * 1000;
      history.roundTripTime.push(roundTripTime);
    }
    
    // Keep history limited to avoid memory issues
    const MAX_HISTORY = 30; // 1 minute at 2s intervals
    
    if (history.timestamps.length > MAX_HISTORY) {
      history.timestamps.shift();
      history.bytesReceived.shift();
      history.packetLoss.shift();
      history.jitter.shift();
      history.roundTripTime.shift();
      history.qualityRatings.shift();
    }
    
    // Determine quality rating based on various factors
    let qualityRating: 'excellent' | 'good' | 'fair' | 'poor' = 'good';
    
    // More sophisticated algorithm for quality rating
    if (packetLoss > 5 || roundTripTime > 500 || jitter > 100 || bitrate < 100000) {
      qualityRating = 'poor';
    } else if (packetLoss > 2 || roundTripTime > 250 || jitter > 50 || bitrate < 300000) {
      qualityRating = 'fair';
    } else if (packetLoss > 0.5 || roundTripTime > 100 || jitter > 20 || bitrate < 1000000) {
      qualityRating = 'good';
    } else {
      qualityRating = 'excellent';
    }
    
    // Add to history for smoothing
    history.qualityRatings.push(qualityRating);
    
    // Apply smoothing to prevent flickering - use most common rating from last few samples
    const recentRatings = history.qualityRatings.slice(-5);
    const counts: Record<string, number> = {
      excellent: 0,
      good: 0, 
      fair: 0,
      poor: 0
    };
    
    recentRatings.forEach(rating => {
      counts[rating]++;
    });
    
    // Find most common rating
    let maxCount = 0;
    let smoothedRating: 'excellent' | 'good' | 'fair' | 'poor' = 'good';
    
    Object.entries(counts).forEach(([rating, count]) => {
      if (count > maxCount) {
        maxCount = count;
        smoothedRating = rating as 'excellent' | 'good' | 'fair' | 'poor';
      }
    });
    
    return {
      bitrate,
      packetLoss,
      jitter,
      roundTripTime,
      qualityRating: smoothedRating
    };
  } catch (error) {
    console.error('Error collecting WebRTC stats:', error);
    return null;
  }
}

/**
 * Clear statistics history for a specific connection
 * @param connectionId The unique connection identifier
 */
export function clearStatsHistory(connectionId: string): void {
  delete statsHistory[connectionId];
}

/**
 * Get connection health score from 0-100 based on current stats
 * @param stats Current call statistics
 * @returns A number from 0-100 representing connection health
 */
export function getConnectionHealthScore(stats: CallStatsType | undefined | null): number {
  if (!stats) return 50; // Default middle score when no stats available
  
  // Start with perfect score and subtract points for issues
  let score = 100;
  
  // Packet loss (0-20% → 0-40 points deduction)
  if (stats.packetLoss) {
    score -= Math.min(40, stats.packetLoss * 2);
  }
  
  // Round trip time (0-500ms → 0-20 points deduction)
  if (stats.roundTripTime) {
    score -= Math.min(20, stats.roundTripTime / 25);
  }
  
  // Jitter (0-100ms → 0-20 points deduction)
  if (stats.jitter) {
    score -= Math.min(20, stats.jitter / 5);
  }
  
  // Low bitrate (below 500kbps → up to 20 points deduction)
  if (stats.bitrate && stats.bitrate < 500000) {
    score -= Math.min(20, (500000 - stats.bitrate) / 25000);
  }
  
  return Math.max(0, Math.min(100, Math.round(score)));
}
