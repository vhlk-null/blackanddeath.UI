import { Directive, ElementRef, HostListener, inject, input, OnDestroy, OnInit } from '@angular/core';

const FRICTION = 0.92;
const MIN_VELOCITY = 0.5;

@Directive({
  selector: '[appDragScroll]',
  standalone: true,
  host: { '[style.cursor]': 'appDragScroll() === "none" ? "default" : dragging ? "grabbing" : "grab"' },
})
export class DragScrollDirective implements OnInit, OnDestroy {
  appDragScroll = input<'x' | 'y' | 'both' | 'none'>('both');

  private el = inject(ElementRef);
  protected dragging = false;
  private startX = 0;
  private startY = 0;
  private scrollLeft = 0;
  private scrollTop = 0;
  private velX = 0;
  private velY = 0;
  private lastX = 0;
  private lastY = 0;
  private rafId: number | null = null;
  private moved = false;
  private captureClick = (e: MouseEvent) => { if (this.moved) { e.stopPropagation(); e.preventDefault(); } };

  ngOnInit(): void {
    this.el.nativeElement.addEventListener('click', this.captureClick, true);
  }

  @HostListener('mousedown', ['$event'])
  onMouseDown(e: MouseEvent): void {
    if (e.button !== 0 || this.appDragScroll() === 'none') return;
    this.cancelMomentum();
    this.dragging = true;
    this.moved = false;
    this.velX = 0;
    this.velY = 0;
    this.startX = this.lastX = e.pageX;
    this.startY = this.lastY = e.pageY;
    this.scrollLeft = this.el.nativeElement.scrollLeft;
    this.scrollTop = this.el.nativeElement.scrollTop;
    this.disableSnap();
    e.preventDefault();
  }

  @HostListener('document:mousemove', ['$event'])
  onMouseMove(e: MouseEvent): void {
    if (!this.dragging) return;
    const axis = this.appDragScroll();
    const el = this.el.nativeElement;
    const dx = e.pageX - this.startX;
    const dy = e.pageY - this.startY;
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) this.moved = true;
    this.velX = e.pageX - this.lastX;
    this.velY = e.pageY - this.lastY;
    this.lastX = e.pageX;
    this.lastY = e.pageY;
    if (axis !== 'y') el.scrollLeft = this.scrollLeft - dx;
    if (axis !== 'x') el.scrollTop  = this.scrollTop  - dy;
  }

  @HostListener('document:mouseup')
  onMouseUp(): void {
    if (!this.dragging) return;
    this.dragging = false;
    this.runMomentum();
    if (this.moved) {
      // defer clearing so the click event that follows mouseup is still blocked
      setTimeout(() => { this.moved = false; }, 100);
    }
  }

  @HostListener('touchstart', ['$event'])
  onTouchStart(e: TouchEvent): void {
    if (this.appDragScroll() === 'none') return;
    this.cancelMomentum();
    this.dragging = true;
    this.moved = false;
    this.velX = 0;
    this.velY = 0;
    this.startX = this.lastX = e.touches[0].pageX;
    this.startY = this.lastY = e.touches[0].pageY;
    this.scrollLeft = this.el.nativeElement.scrollLeft;
    this.scrollTop = this.el.nativeElement.scrollTop;
    this.disableSnap();
  }

  @HostListener('touchmove', ['$event'])
  onTouchMove(e: TouchEvent): void {
    if (!this.dragging) return;
    const axis = this.appDragScroll();
    const el = this.el.nativeElement;
    const dx = e.touches[0].pageX - this.startX;
    const dy = e.touches[0].pageY - this.startY;
    this.velX = e.touches[0].pageX - this.lastX;
    this.velY = e.touches[0].pageY - this.lastY;
    this.lastX = e.touches[0].pageX;
    this.lastY = e.touches[0].pageY;
    if (axis !== 'y') el.scrollLeft = this.scrollLeft - dx;
    if (axis !== 'x') el.scrollTop  = this.scrollTop  - dy;
  }

  @HostListener('touchend')
  onTouchEnd(): void {
    this.dragging = false;
    this.runMomentum();
  }

  private disableSnap(): void {
    const el = this.el.nativeElement;
    el.style.scrollBehavior = 'auto';
    el.style.scrollSnapType = 'none';
  }

  private restoreSnap(): void {
    const el = this.el.nativeElement;
    el.style.scrollBehavior = '';
    el.style.scrollSnapType = '';
  }

  private runMomentum(): void {
    const axis = this.appDragScroll();
    const el = this.el.nativeElement;
    const step = () => {
      this.velX *= FRICTION;
      this.velY *= FRICTION;
      if (axis !== 'y') el.scrollLeft -= this.velX;
      if (axis !== 'x') el.scrollTop  -= this.velY;
      const stillMoving =
        (axis !== 'y' && Math.abs(this.velX) > MIN_VELOCITY) ||
        (axis !== 'x' && Math.abs(this.velY) > MIN_VELOCITY);
      if (stillMoving) {
        this.rafId = requestAnimationFrame(step);
      } else {
        this.rafId = null;
        this.restoreSnap();
      }
    };
    this.rafId = requestAnimationFrame(step);
  }

  private cancelMomentum(): void {
    if (this.rafId !== null) { cancelAnimationFrame(this.rafId); this.rafId = null; }
  }

  ngOnDestroy(): void {
    this.cancelMomentum();
    this.el.nativeElement.removeEventListener('click', this.captureClick, true);
  }
}
