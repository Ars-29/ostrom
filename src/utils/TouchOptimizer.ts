/**
 * Touch Optimization System
 * Optimizes touch interactions for mobile devices
 */

export interface TouchConfig {
  // Touch sensitivity
  touchSensitivity: number;
  swipeThreshold: number;
  tapThreshold: number;
  
  // Performance optimizations
  enableTouchFeedback: boolean;
  enableHapticFeedback: boolean;
  enableTouchPrevention: boolean;
  
  // Gesture recognition
  enableSwipeGestures: boolean;
  enablePinchZoom: boolean;
  enableDoubleTap: boolean;
  
  // Accessibility
  enableTouchAccessibility: boolean;
  touchTargetSize: number;
}

export interface TouchState {
  isTouching: boolean;
  touchStartTime: number;
  touchStartPosition: { x: number; y: number };
  touchCurrentPosition: { x: number; y: number };
  touchVelocity: { x: number; y: number };
  gestureType: 'tap' | 'swipe' | 'pinch' | 'none';
  gestureDirection: 'up' | 'down' | 'left' | 'right' | 'none';
}

export class TouchOptimizer {
  private config: TouchConfig;
  private touchState: TouchState;
  private touchHistory: Array<{ time: number; x: number; y: number }> = [];
  private isMobile: boolean;
  
  constructor(config?: Partial<TouchConfig>) {
    this.isMobile = this.detectMobile();
    this.config = this.getDefaultConfig();
    
    // Override with custom config
    if (config) {
      this.config = { ...this.config, ...config };
    }
    
    this.touchState = {
      isTouching: false,
      touchStartTime: 0,
      touchStartPosition: { x: 0, y: 0 },
      touchCurrentPosition: { x: 0, y: 0 },
      touchVelocity: { x: 0, y: 0 },
      gestureType: 'none',
      gestureDirection: 'none'
    };
    
    console.log('📱 [TouchOptimizer] Initialized for', this.isMobile ? 'mobile' : 'desktop');
  }
  
  private detectMobile(): boolean {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
           window.innerWidth <= 768 ||
           'ontouchstart' in window;
  }
  
  private getDefaultConfig(): TouchConfig {
    return {
      touchSensitivity: this.isMobile ? 1.5 : 1.0,
      swipeThreshold: 50,
      tapThreshold: 300,
      enableTouchFeedback: this.isMobile,
      enableHapticFeedback: this.isMobile,
      enableTouchPrevention: this.isMobile,
      enableSwipeGestures: this.isMobile,
      enablePinchZoom: this.isMobile,
      enableDoubleTap: this.isMobile,
      enableTouchAccessibility: true,
      touchTargetSize: this.isMobile ? 44 : 32 // iOS/Android minimum touch target
    };
  }
  
  /**
   * Handle touch start event
   */
  public handleTouchStart(event: TouchEvent): TouchState {
    const touch = event.touches[0];
    const now = performance.now();
    
    this.touchState.isTouching = true;
    this.touchState.touchStartTime = now;
    this.touchState.touchStartPosition = { x: touch.clientX, y: touch.clientY };
    this.touchState.touchCurrentPosition = { x: touch.clientX, y: touch.clientY };
    
    // Clear touch history
    this.touchHistory = [];
    this.touchHistory.push({ time: now, x: touch.clientX, y: touch.clientY });
    
    // Prevent default for certain gestures
    if (this.config.enableTouchPrevention) {
      this.preventDefaultGestures(event);
    }
    
    // Haptic feedback
    if (this.config.enableHapticFeedback) {
      this.triggerHapticFeedback('light');
    }
    
    console.log('👆 [TouchOptimizer] Touch start:', this.touchState.touchStartPosition);
    return { ...this.touchState };
  }
  
  /**
   * Handle touch move event
   */
  public handleTouchMove(event: TouchEvent): TouchState {
    if (!this.touchState.isTouching) return this.touchState;
    
    const touch = event.touches[0];
    const now = performance.now();
    
    this.touchState.touchCurrentPosition = { x: touch.clientX, y: touch.clientY };
    
    // Update touch history
    this.touchHistory.push({ time: now, x: touch.clientX, y: touch.clientY });
    
    // Keep only last 10 touch points for velocity calculation
    if (this.touchHistory.length > 10) {
      this.touchHistory.shift();
    }
    
    // Calculate velocity
    this.calculateVelocity();
    
    // Detect gesture type
    this.detectGesture();
    
    // Prevent scrolling during certain gestures
    if (this.config.enableTouchPrevention && this.touchState.gestureType !== 'none') {
      event.preventDefault();
    }
    
    return { ...this.touchState };
  }
  
  /**
   * Handle touch end event
   */
  public handleTouchEnd(): TouchState {
    if (!this.touchState.isTouching) return this.touchState;
    
    const now = performance.now();
    const touchDuration = now - this.touchState.touchStartTime;
    
    // Final gesture detection
    this.detectGesture();
    
    // Handle different gesture types
    switch (this.touchState.gestureType) {
      case 'tap':
        this.handleTap(touchDuration);
        break;
      case 'swipe':
        this.handleSwipe();
        break;
      default:
        this.handleGenericTouch();
    }
    
    // Reset touch state
    this.touchState.isTouching = false;
    this.touchState.gestureType = 'none';
    this.touchState.gestureDirection = 'none';
    
    console.log('👆 [TouchOptimizer] Touch end:', this.touchState.gestureType);
    return { ...this.touchState };
  }
  
  /**
   * Calculate touch velocity
   */
  private calculateVelocity(): void {
    if (this.touchHistory.length < 2) return;
    
    const recent = this.touchHistory.slice(-3); // Last 3 points
    const deltaTime = recent[recent.length - 1].time - recent[0].time;
    
    if (deltaTime > 0) {
      const deltaX = recent[recent.length - 1].x - recent[0].x;
      const deltaY = recent[recent.length - 1].y - recent[0].y;
      
      this.touchState.touchVelocity = {
        x: deltaX / deltaTime,
        y: deltaY / deltaTime
      };
    }
  }
  
  /**
   * Detect gesture type based on touch movement
   */
  private detectGesture(): void {
    const deltaX = this.touchState.touchCurrentPosition.x - this.touchState.touchStartPosition.x;
    const deltaY = this.touchState.touchCurrentPosition.y - this.touchState.touchStartPosition.y;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    
    // Determine gesture type
    if (distance < 10) {
      this.touchState.gestureType = 'tap';
      this.touchState.gestureDirection = 'none';
    } else if (distance > this.config.swipeThreshold) {
      this.touchState.gestureType = 'swipe';
      
      // Determine swipe direction
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        this.touchState.gestureDirection = deltaX > 0 ? 'right' : 'left';
      } else {
        this.touchState.gestureDirection = deltaY > 0 ? 'down' : 'up';
      }
    } else {
      this.touchState.gestureType = 'none';
      this.touchState.gestureDirection = 'none';
    }
  }
  
  /**
   * Handle tap gesture
   */
  private handleTap(duration: number): void {
    if (duration < this.config.tapThreshold) {
      console.log('👆 [TouchOptimizer] Tap detected');
      
      // Haptic feedback for tap
      if (this.config.enableHapticFeedback) {
        this.triggerHapticFeedback('medium');
      }
      
      // Dispatch custom tap event
      this.dispatchCustomEvent('touch-tap', {
        position: this.touchState.touchCurrentPosition,
        duration
      });
    }
  }
  
  /**
   * Handle swipe gesture
   */
  private handleSwipe(): void {
    console.log('👆 [TouchOptimizer] Swipe detected:', this.touchState.gestureDirection);
    
    // Haptic feedback for swipe
    if (this.config.enableHapticFeedback) {
      this.triggerHapticFeedback('heavy');
    }
    
    // Dispatch custom swipe event
    this.dispatchCustomEvent('touch-swipe', {
      direction: this.touchState.gestureDirection,
      velocity: this.touchState.touchVelocity,
      startPosition: this.touchState.touchStartPosition,
      endPosition: this.touchState.touchCurrentPosition
    });
  }
  
  /**
   * Handle generic touch
   */
  private handleGenericTouch(): void {
    console.log('👆 [TouchOptimizer] Generic touch detected');
    
    // Dispatch generic touch event
    this.dispatchCustomEvent('touch-generic', {
      position: this.touchState.touchCurrentPosition,
      duration: performance.now() - this.touchState.touchStartTime
    });
  }
  
  /**
   * Prevent default browser gestures
   */
  private preventDefaultGestures(event: TouchEvent): void {
    // Prevent zoom on double tap
    if (event.touches.length > 1) {
      event.preventDefault();
    }
    
    // Prevent context menu on long press
    if (performance.now() - this.touchState.touchStartTime > 500) {
      event.preventDefault();
    }
  }
  
  /**
   * Trigger haptic feedback
   */
  private triggerHapticFeedback(intensity: 'light' | 'medium' | 'heavy'): void {
    if (!this.config.enableHapticFeedback) return;
    
    try {
      // Check if Vibration API is available
      if ('vibrate' in navigator) {
        const patterns = {
          light: [10],
          medium: [20],
          heavy: [30]
        };
        
        navigator.vibrate(patterns[intensity]);
      }
    } catch (error) {
      console.warn('⚠️ [TouchOptimizer] Haptic feedback not supported');
    }
  }
  
  /**
   * Dispatch custom touch events
   */
  private dispatchCustomEvent(eventName: string, detail: any): void {
    const event = new CustomEvent(eventName, {
      detail,
      bubbles: true,
      cancelable: true
    });
    
    document.dispatchEvent(event);
  }
  
  /**
   * Get current touch state
   */
  public getTouchState(): TouchState {
    return { ...this.touchState };
  }
  
  /**
   * Get touch configuration
   */
  public getConfig(): TouchConfig {
    return { ...this.config };
  }
  
  /**
   * Update touch configuration
   */
  public updateConfig(newConfig: Partial<TouchConfig>): void {
    this.config = { ...this.config, ...newConfig };
    console.log('📱 [TouchOptimizer] Config updated:', this.config);
  }
  
  /**
   * Check if device supports touch
   */
  public isTouchDevice(): boolean {
    return this.isMobile;
  }
  
  /**
   * Get recommended touch target size
   */
  public getTouchTargetSize(): number {
    return this.config.touchTargetSize;
  }
}

// Singleton instance
let touchOptimizer: TouchOptimizer | null = null;

/**
 * Get the touch optimizer instance
 */
export const getTouchOptimizer = (): TouchOptimizer => {
  if (!touchOptimizer) {
    touchOptimizer = new TouchOptimizer();
  }
  return touchOptimizer;
};
